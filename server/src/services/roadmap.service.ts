import mongoose from 'mongoose';
import { Project, IProject } from '../models/Project';
import { ProjectApproval, IProjectApproval, ProjectApprovalStatus } from '../models/ProjectApproval';
import { Application } from '../models/Application';
import { AIRoadmapService, ComprehensiveRoadmapResponse } from './ai/aiRoadmap.service';
import { AIComplianceService } from './ai/aiCompliance.service';
import { Logger } from '../utils/logger';

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
  complianceScore?: number;
  summary?: string;
  approvals: IProjectApproval[];
  documents?: { name: string; usedFor: string[] }[];
  inspectionPlan?: { department: string; stage: string; reason: string }[];
  schemes?: { name: string; benefit: string; eligibility: string }[];
  generatedAt: Date;
}

export class RoadmapService {
  /**
   * Generates a personalized statutory approval roadmap for a project
   * by invoking the Gemini 2.5 Flash AI Approval Intelligence Engine and MongoDB regulations.
   */
  static async generateApprovalRoadmap(projectId: string): Promise<StoredRoadmapResponse> {
    const aiResult = await AIRoadmapService.generateRoadmap(projectId, true);
    return aiResult as unknown as StoredRoadmapResponse;
  }

  /**
   * Retrieves an existing roadmap for a project.
   */
  static async getRoadmap(projectId: string): Promise<StoredRoadmapResponse | null> {
    const aiResult = await AIRoadmapService.getRoadmap(projectId);
    if (!aiResult) {
      return null;
    }
    return aiResult as unknown as StoredRoadmapResponse;
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

    // Trigger AI Compliance score recalculation whenever approval status changes
    AIComplianceService.calculateComplianceScore(approval.projectId.toString()).catch(() => {});

    // Automatically sync or queue in Officer Workplace if entrepreneur applied for approval
    if (status === 'Applied' || status === 'Under Review') {
      try {
        let app = await Application.findOne({ approvalId: approval._id });
        if (!app) {
          const project = await Project.findById(approval.projectId);
          const appNumber = `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          app = new Application({
            applicationNumber: appNumber,
            projectId: approval.projectId,
            approvalId: approval._id,
            department: approval.department || 'Industries Department',
            serviceName: approval.approvalName,
            priority: approval.priority === 'High' ? 'High' : 'Normal',
            slaDays: approval.estimatedDays || 21,
            status: 'Submitted',
            currentStage: 'Document Scrutiny',
            remarks: `Application submitted by entrepreneur for ${approval.approvalName} via Statutory Roadmap`,
            submittedAt: new Date(),
            lastUpdated: new Date(),
            history: [
              {
                action: 'Roadmap Application Submitted',
                toStatus: 'Submitted',
                remarks: `Applied for ${approval.approvalName}`,
                timestamp: new Date(),
              },
            ],
          });
          await app.save();
        } else {
          app.status = 'Submitted';
          app.currentStage = 'Document Scrutiny';
          app.lastUpdated = new Date();
          await app.save();
        }
      } catch (syncErr: any) {
        Logger.warn(`Failed to sync application from roadmap approval: ${syncErr.message}`);
      }
    }

    return approval;
  }
}
export default RoadmapService;
