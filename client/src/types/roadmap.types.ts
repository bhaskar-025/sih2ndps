export type ApprovalPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type ProjectApprovalStatus =
  | 'Recommended'
  | 'Pending'
  | 'Documents Missing'
  | 'Ready to Apply'
  | 'Applied'
  | 'Under Review'
  | 'Inspection Pending'
  | 'Approved'
  | 'Rejected';

export interface ProjectApprovalItem {
  _id: string;
  projectId: string;
  approvalTemplateId?: string;
  approvalName: string;
  department: string;
  status: ProjectApprovalStatus;
  priority: ApprovalPriority;
  reason: string;
  estimatedDays: number;
  inspectionRequired: boolean;
  dependencies: string[];
  requiredDocuments: string[];
  generatedBy: 'RuleEngine' | 'Officer' | 'AI';
  generatedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParallelWorkflowStage {
  stage: string;
  approvals: string[];
  canRunParallel: boolean;
}

export interface RoadmapData {
  generated: boolean;
  projectId?: string;
  projectName?: string;
  companyName?: string;
  industry?: string;
  pollutionCategory?: string;
  totalApprovals: number;
  totalDepartments: number;
  estimatedTimeline: number;
  requiredDocuments: string[];
  parallelWorkflows: ParallelWorkflowStage[];
  readinessScore: number;
  approvals: ProjectApprovalItem[];
  timeline?: { stage: string; approvals: string[]; estimatedDays: number; canRunParallel?: boolean }[];
  documents?: { name: string; usedFor: string[] }[];
  schemes?: { name: string; benefit: string; eligibility: string }[];
  complianceScore?: number;
  summary?: string;
  generatedAt?: string;
  message?: string;
}

export interface RoadmapResponse {
  success: boolean;
  message?: string;
  data: RoadmapData;
}

export interface SingleApprovalResponse {
  success: boolean;
  message?: string;
  data: ProjectApprovalItem;
}
