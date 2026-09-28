import mongoose from 'mongoose';
import { Project, IProject } from '../models/Project';
import { ProjectApproval, IProjectApproval, ProjectApprovalStatus } from '../models/ProjectApproval';
import { ApprovalTemplate } from '../models/ApprovalTemplate';
import { ApprovalRuleEngine, ApprovalRoadmapOutput } from './ruleEngine';

export interface StoredRoadmapResponse {
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
  approvals: IProjectApproval[];
  generatedAt: Date;
}

export class RoadmapService {
  /**
   * Generates a personalized statutory approval roadmap for a project
   * by running the Approval Intelligence Engine business rules.
   */
  static async generateApprovalRoadmap(projectId: string): Promise<StoredRoadmapResponse> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error('Invalid project ID format');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Run the configurable Rule Engine
    const ruleResult: ApprovalRoadmapOutput = ApprovalRuleEngine.evaluateProject(project);

    // Look up any matching ApprovalTemplates for ID linking
    const templateNames = ruleResult.approvals.map((a) => a.approvalName);
    const existingTemplates = await ApprovalTemplate.find({
      name: { $in: templateNames },
    }).lean();

    const templateMap = new Map<string, mongoose.Types.ObjectId>();
    existingTemplates.forEach((tpl: any) => {
      templateMap.set(tpl.name, tpl._id);
    });

    // Clear previously generated approvals for this project to prevent stale duplicates
    await ProjectApproval.deleteMany({ projectId: project._id });

    // Prepare documents for insertion
    const approvalsToInsert = ruleResult.approvals.map((item) => ({
      projectId: project._id,
      approvalTemplateId: templateMap.get(item.approvalName) || undefined,
      approvalName: item.approvalName,
      department: item.department,
      status: 'Recommended' as ProjectApprovalStatus,
      priority: item.priority,
      reason: item.reason,
      estimatedDays: item.estimatedDays,
      inspectionRequired: item.inspectionRequired,
      dependencies: item.dependencies,
      requiredDocuments: item.requiredDocuments,
      generatedBy: 'RuleEngine',
      generatedAt: new Date(),
    }));

    const savedApprovals = (await ProjectApproval.insertMany(approvalsToInsert)) as unknown as IProjectApproval[];

    return {
      projectId: project._id.toString(),
      projectName: project.projectName,
      companyName: project.companyName,
      industry: project.industry,
      pollutionCategory: project.pollutionCategory,
      totalApprovals: savedApprovals.length,
      totalDepartments: ruleResult.totalDepartments,
      estimatedTimeline: ruleResult.estimatedTimeline,
      requiredDocuments: ruleResult.requiredDocuments,
      parallelWorkflows: ruleResult.parallelWorkflows,
      readinessScore: ruleResult.readinessScore,
      approvals: savedApprovals,
      generatedAt: new Date(),
    };

  }

  /**
   * Retrieves an existing roadmap for a project.
   */
  static async getRoadmap(projectId: string): Promise<StoredRoadmapResponse | null> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error('Invalid project ID format');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const approvals = await ProjectApproval.find({ projectId: project._id }).sort({
      priority: 1,
      estimatedDays: 1,
    });

    if (!approvals || approvals.length === 0) {
      return null;
    }

    // Compute meta stats from stored approvals
    const departmentsSet = new Set<string>();
    const docSet = new Set<string>();
    approvals.forEach((a) => {
      departmentsSet.add(a.department);
      a.requiredDocuments.forEach((doc) => docSet.add(doc));
    });

    // Compute parallel stages
    const stage1 = approvals.filter(
      (a) =>
        a.dependencies.length === 0 ||
        a.approvalName.includes('Provisional') ||
        a.approvalName.includes('Consent to Establish')
    );
    const stage2 = approvals.filter(
      (a) =>
        !stage1.includes(a) &&
        (a.department.includes('Water') ||
          a.department.includes('Electricity') ||
          a.department.includes('Labour'))
    );
    const stage3 = approvals.filter((a) => !stage1.includes(a) && !stage2.includes(a));

    const parallelWorkflows = [
      {
        stage: 'Phase 1: Pre-Construction Clearances & Planning NOCs',
        approvals: stage1.map((a) => a.approvalName),
        canRunParallel: true,
      },
      {
        stage: 'Phase 2: Utility Allotments & Civil Approvals',
        approvals: stage2.map((a) => a.approvalName),
        canRunParallel: true,
      },
      {
        stage: 'Phase 3: Statutory Equipment Certification & Operational Licenses',
        approvals: stage3.map((a) => a.approvalName),
        canRunParallel: false,
      },
    ];

    const maxStage1 = stage1.length ? Math.max(...stage1.map((a) => a.estimatedDays)) : 20;
    const maxStage2 = stage2.length ? Math.max(...stage2.map((a) => a.estimatedDays)) : 15;
    const maxStage3 = stage3.length ? Math.max(...stage3.map((a) => a.estimatedDays)) : 10;
    const estimatedTimeline = maxStage1 + maxStage2 + maxStage3;

    let readinessScore = 40;
    if (project.investment > 0) readinessScore += 15;
    if (project.landArea > 0) readinessScore += 15;
    if (project.waterRequirement > 0 && project.powerRequirement > 0) readinessScore += 15;
    if (project.location && project.taluka) readinessScore += 15;
    readinessScore = Math.min(100, readinessScore);

    return {
      projectId: project._id.toString(),
      projectName: project.projectName,
      companyName: project.companyName,
      industry: project.industry,
      pollutionCategory: project.pollutionCategory,
      totalApprovals: approvals.length,
      totalDepartments: departmentsSet.size,
      estimatedTimeline,
      requiredDocuments: Array.from(docSet),
      parallelWorkflows,
      readinessScore,
      approvals,
      generatedAt: approvals[0]?.generatedAt || new Date(),
    };
  }

  /**
   * Updates an approval's status (e.g. Applied, Under Review, Approved, etc.)
   */
  static async updateApprovalStatus(
    approvalId: string,
    status: ProjectApprovalStatus
  ): Promise<IProjectApproval> {
    if (!mongoose.Types.ObjectId.isValid(approvalId)) {
      throw new Error('Invalid approval ID format');
    }

    const approval = await ProjectApproval.findById(approvalId);
    if (!approval) {
      throw new Error('Approval record not found');
    }

    approval.status = status;
    await approval.save();
    return approval;
  }
}
export default RoadmapService;
