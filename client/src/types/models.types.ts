import { User, UserRole } from './auth.types';

export type ProjectStatus = 'Draft' | 'Submitted' | 'Under_Review' | 'Approved' | 'Rejected';
export type ApplicationStatus = 'Pending' | 'In_Progress' | 'Clarification_Required' | 'Approved' | 'Rejected';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Revoked';
export type ComplianceStatus = 'Pending' | 'Submitted' | 'Compliant' | 'Overdue';

export interface Project {
  _id: string;
  title: string;
  description: string;
  entrepreneurId: string | User;
  industryType: string;
  investmentAmountInLakhs: number;
  landRequiredInAcres: number;
  district: string;
  taluka: string;
  status: ProjectStatus;
  trackingNumber: string;
  submissionDate?: string;
  approvalDate?: string;
  createdAt: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  nodalOfficer: string;
  email: string;
  phone: string;
  servicesOffered: string[];
  averageProcessingDays: number;
  isActive: boolean;
}

export interface Application {
  _id: string;
  applicationNumber: string;
  projectId: string | Project;
  entrepreneurId: string | User;
  departmentId: string | Department;
  serviceName: string;
  status: ApplicationStatus;
  currentStage: string;
  priority: 'Normal' | 'High' | 'Urgent';
  trackingId: string;
  remarks?: string;
  timeline: {
    stage: string;
    status: ApplicationStatus;
    updatedBy?: string;
    comments?: string;
    timestamp: string;
  }[];
  submittedAt: string;
  createdAt: string;
}

export interface Approval {
  _id: string;
  applicationId: string | Application;
  departmentId: string | Department;
  officerId: string | User;
  status: ApprovalStatus;
  approvedAt?: string;
  validityPeriodMonths: number;
  licenseCertificateNumber?: string;
  digitalSignatureHash?: string;
  conditions: string[];
  remarks?: string;
  createdAt: string;
}

export interface DocumentItem {
  _id: string;
  title: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  sizeInBytes: number;
  uploadedBy: string | User;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
  aiClassificationTag?: string;
  aiConfidenceScore?: number;
  createdAt: string;
}

export interface Scheme {
  _id: string;
  name?: string;
  schemeName?: string;
  code?: string;
  department?: string;
  departmentId?: string | Department;
  description: string;
  eligibilityCriteria: string[];
  financialIncentiveSummary?: string;
  subsidyPercentage?: number;
  maxSubsidyAmount?: number;
  active: boolean;
  applicationDeadline?: string;
}

export interface ComplianceTask {
  _id: string;
  projectId: string | Project;
  departmentId: string | Department;
  taskName: string;
  description?: string;
  periodicity: 'One_Time' | 'Monthly' | 'Quarterly' | 'Annual';
  dueDate: string;
  status: ComplianceStatus;
  penaltyRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  mandatoryDocuments: string[];
}
