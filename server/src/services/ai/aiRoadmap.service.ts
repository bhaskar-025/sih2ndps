import mongoose from 'mongoose';
import { Project, IProject } from '../../models/Project';
import { Regulation } from '../../models/Regulation';
import { Rule } from '../../models/Rule';
import { StatutoryApproval } from '../../models/StatutoryApproval';
import { Scheme } from '../../models/Scheme';
import { DocumentMaster } from '../../models/DocumentMaster';
import { Industry } from '../../models/Industry';
import { Roadmap, IRoadmap } from '../../models/Roadmap';
import { ProjectApproval, IProjectApproval, ProjectApprovalStatus } from '../../models/ProjectApproval';
import { GeminiService, AIRoadmapOutput } from './gemini.service';
import { Logger } from '../../utils/logger';

export interface ComprehensiveRoadmapResponse {
  projectId: string;
  projectName: string;
  companyName: string;
  industry: string;
  pollutionCategory: string;
  totalApprovals: number;
  totalDepartments: number;
  estimatedTimeline: number;
  requiredDocuments: string[];
  parallelWorkflows: {
    stage: string;
    approvals: string[];
    canRunParallel: boolean;
  }[];
  readinessScore: number;
  complianceScore: number;
  summary: string;
  approvals: any[];
  documents: { name: string; usedFor: string[] }[];
  timeline: { stage: string; approvals: string[]; estimatedDays: number; canRunParallel?: boolean }[];
  inspectionPlan: { department: string; stage: string; reason: string }[];
  schemes: { name: string; benefit: string; eligibility: string }[];
  generatedBy: string;
  generatedAt: Date;
  fromCache: boolean;
}

export class AIRoadmapService {
  /**
   * Generates or retrieves cached approval roadmap powered by Gemini 2.5 Flash and MongoDB.
   * If a cached roadmap exists and forceRegenerate is false, returns cached roadmap.
   */
  public static async generateRoadmap(
    projectId: string,
    forceRegenerate: boolean = false
  ): Promise<ComprehensiveRoadmapResponse> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error('Invalid project ID format');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // 1. Check Cache
    if (!forceRegenerate) {
      const cachedRoadmap = await Roadmap.findOne({ projectId: project._id });
      if (cachedRoadmap && cachedRoadmap.approvals?.length > 0) {
        Logger.info(`Returning cached AI roadmap for Project: "${project.projectName}"`);
        const storedApprovals = await ProjectApproval.find({ projectId: project._id }).sort({
          priority: 1,
          estimatedDays: 1,
        });

        return this.formatRoadmapResponse(project, cachedRoadmap, storedApprovals, true);
      }
    }

    Logger.info(
      `Triggering ${forceRegenerate ? 'REGENERATION' : 'NEW GENERATION'} of Statutory Roadmap for project: ${project.projectName} (${project.industry})`
    );

    // 2. Clear previous roadmap and approvals if regenerating
    await Roadmap.deleteMany({ projectId: project._id });
    await ProjectApproval.deleteMany({ projectId: project._id });

    // 3. Load structured regulatory context from MongoDB
    const [regulations, rules, approvalsDatabase, schemes, documentMasters, industryProfile] =
      await Promise.all([
        Regulation.find({
          $or: [
            { applicableIndustries: 'ALL' },
            { applicableIndustries: { $regex: new RegExp(project.industry, 'i') } },
          ],
        }),
        Rule.find({
          isActive: true,
          $or: [
            { applicableIndustries: 'ALL' },
            { applicableIndustries: { $regex: new RegExp(project.industry, 'i') } },
          ],
        }),
        StatutoryApproval.find({
          isActive: true,
          $or: [
            { industry: 'ALL' },
            { industry: { $regex: new RegExp(project.industry, 'i') } },
          ],
        }),
        Scheme.find({ active: true }),
        DocumentMaster.find({
          $or: [
            { applicableIndustries: 'ALL' },
            { applicableIndustries: { $regex: new RegExp(project.industry, 'i') } },
          ],
        }),
        Industry.findOne({
          name: { $regex: new RegExp(project.industry, 'i') },
        }),
      ]);

    // 4. Send structured context to Gemini 2.5 Flash
    const aiOutput: AIRoadmapOutput = await GeminiService.generateApprovalRoadmap({
      project,
      industryProfile,
      regulations,
      rules,
      approvalsDatabase,
      schemes,
      documentMasters,
    });

    // 5. Compute Workflow Phasing and Critical Path Timelines
    const stage1Approvals = aiOutput.approvals.filter(
      (a) =>
        a.approval.toLowerCase().includes('provisional') ||
        a.approval.toLowerCase().includes('establish') ||
        a.approval.toLowerCase().includes('plan approval') ||
        a.approval.toLowerCase().includes('siting') ||
        a.approval.toLowerCase().includes('clearance')
    );
    const stage2Approvals = aiOutput.approvals.filter(
      (a) =>
        !stage1Approvals.includes(a) &&
        (a.department.toLowerCase().includes('water') ||
          a.department.toLowerCase().includes('electricity') ||
          a.department.toLowerCase().includes('midc') ||
          a.department.toLowerCase().includes('development'))
    );
    const stage3Approvals = aiOutput.approvals.filter(
      (a) => !stage1Approvals.includes(a) && !stage2Approvals.includes(a)
    );

    const parallelWorkflows = [
      {
        stage: 'Phase 1: Pre-Construction Clearances & Planning NOCs',
        approvals: (stage1Approvals.length ? stage1Approvals : aiOutput.approvals.slice(0, 3)).map(
          (a) => a.approval
        ),
        canRunParallel: true,
      },
      {
        stage: 'Phase 2: Utility Allotments & Civil Approvals',
        approvals: (stage2Approvals.length ? stage2Approvals : aiOutput.approvals.slice(3, 6)).map(
          (a) => a.approval
        ),
        canRunParallel: true,
      },
      {
        stage: 'Phase 3: Statutory Equipment Certification & Operational Licenses',
        approvals: (stage3Approvals.length ? stage3Approvals : aiOutput.approvals.slice(6)).map(
          (a) => a.approval
        ),
        canRunParallel: false,
      },
    ];

    const maxStage1 = stage1Approvals.length
      ? Math.max(...stage1Approvals.map((a) => a.estimatedDays))
      : 20;
    const maxStage2 = stage2Approvals.length
      ? Math.max(...stage2Approvals.map((a) => a.estimatedDays))
      : 15;
    const maxStage3 = stage3Approvals.length
      ? Math.max(...stage3Approvals.map((a) => a.estimatedDays))
      : 10;
    const estimatedTimeline = maxStage1 + maxStage2 + maxStage3;

    // Collect unique departments and required documents
    const uniqueDepartments = Array.from(new Set(aiOutput.approvals.map((a) => a.department)));
    const uniqueDocs = Array.from(new Set(aiOutput.documents.map((d) => d.name)));

    const timelineToSave = aiOutput.timeline?.length
      ? aiOutput.timeline
      : [
          {
            stage: 'Phase 1: Pre-Construction Clearances & Planning NOCs',
            approvals: parallelWorkflows[0].approvals,
            estimatedDays: maxStage1,
            canRunParallel: true,
          },
          {
            stage: 'Phase 2: Utility Allotments & Civil Approvals',
            approvals: parallelWorkflows[1].approvals,
            estimatedDays: maxStage2,
            canRunParallel: true,
          },
          {
            stage: 'Phase 3: Statutory Equipment Certification & Operational Licenses',
            approvals: parallelWorkflows[2].approvals,
            estimatedDays: maxStage3,
            canRunParallel: false,
          },
        ];

    // 6. Save in Roadmap collection (Cache)
    const savedRoadmap = await Roadmap.create({
      projectId: project._id,
      approvals: aiOutput.approvals,
      documents: aiOutput.documents,
      timeline: timelineToSave,
      inspectionPlan: aiOutput.inspectionPlan,
      schemes: aiOutput.schemes,
      complianceScore: aiOutput.complianceScore,
      summary: aiOutput.summary,
      totalApprovals: aiOutput.approvals.length,
      totalDepartments: uniqueDepartments.length,
      estimatedTimeline,
      requiredDocuments: uniqueDocs,
      parallelWorkflows,
      readinessScore: aiOutput.complianceScore,
      generatedBy: 'Gemini-2.5-Flash',
      generatedAt: new Date(),
    });

    // 7. Save into ProjectApproval records for synchronization with existing tables and inspection scheduler
    const projectApprovalsToInsert = aiOutput.approvals.map((app) => {
      // Find matching documents recommended for this approval
      const matchingDocs = aiOutput.documents
        .filter(
          (doc) =>
            doc.usedFor.some((target) => target.toLowerCase().includes(app.approval.toLowerCase())) ||
            doc.usedFor.length === 0
        )
        .map((doc) => doc.name);

      const inspectionRequired = aiOutput.inspectionPlan.some(
        (ins) =>
          ins.department.toLowerCase().includes(app.department.toLowerCase()) ||
          app.approval.toLowerCase().includes('operate') ||
          app.approval.toLowerCase().includes('fire') ||
          app.approval.toLowerCase().includes('factory')
      );

      return {
        projectId: project._id,
        approvalName: app.approval,
        department: app.department,
        status: 'Recommended' as ProjectApprovalStatus,
        priority: app.priority,
        reason: app.reason,
        estimatedDays: app.estimatedDays,
        inspectionRequired,
        dependencies: [],
        requiredDocuments: matchingDocs.length > 0 ? matchingDocs : uniqueDocs.slice(0, 3),
        generatedBy: 'AI' as const,
        generatedAt: new Date(),
      };
    });

    const savedProjectApprovals = (await ProjectApproval.insertMany(
      projectApprovalsToInsert
    )) as unknown as IProjectApproval[];

    Logger.info(
      `✓ Successfully saved Roadmap and ${savedProjectApprovals.length} ProjectApproval records for ${project.projectName}.`
    );

    return this.formatRoadmapResponse(project, savedRoadmap, savedProjectApprovals, false);
  }

  /**
   * Retrieves existing stored roadmap for a project
   */
  public static async getRoadmap(projectId: string): Promise<ComprehensiveRoadmapResponse | null> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error('Invalid project ID format');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const roadmap = await Roadmap.findOne({ projectId: project._id });
    if (!roadmap) {
      return null;
    }

    const projectApprovals = await ProjectApproval.find({ projectId: project._id }).sort({
      priority: 1,
      estimatedDays: 1,
    });

    return this.formatRoadmapResponse(project, roadmap, projectApprovals, true);
  }

  /**
   * Helper to format consistent response for both AI API and existing UI consumers
   */
  private static formatRoadmapResponse(
    project: IProject,
    roadmap: IRoadmap,
    approvals: IProjectApproval[],
    fromCache: boolean
  ): ComprehensiveRoadmapResponse {
    return {
      projectId: project._id.toString(),
      projectName: project.projectName,
      companyName: project.companyName,
      industry: project.industry,
      pollutionCategory: project.pollutionCategory,
      totalApprovals: roadmap.totalApprovals || approvals.length,
      totalDepartments: roadmap.totalDepartments || 4,
      estimatedTimeline: roadmap.estimatedTimeline || 45,
      requiredDocuments: roadmap.requiredDocuments || [],
      parallelWorkflows: roadmap.parallelWorkflows || [],
      readinessScore: roadmap.readinessScore || 85,
      complianceScore: roadmap.complianceScore || 85,
      summary: roadmap.summary || 'AI-generated statutory approval roadmap.',
      approvals: approvals,
      documents: roadmap.documents || [],
      timeline: (roadmap as any).timeline || [],
      inspectionPlan: roadmap.inspectionPlan || [],
      schemes: roadmap.schemes || [],
      generatedBy: roadmap.generatedBy || 'Gemini-2.5-Flash',
      generatedAt: roadmap.generatedAt || new Date(),
      fromCache,
    };
  }
}

export default AIRoadmapService;
