export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Scrutiny'
  | 'Query Raised'
  | 'Inspection Scheduled'
  | 'Inspection Completed'
  | 'Approved'
  | 'Rejected';

export type ApplicationPriority = 'Normal' | 'High' | 'Urgent' | 'Critical';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface ApplicationQueryItem {
  _id: string;
  queryText: string;
  raisedBy?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  raisedAt: string;
  status: 'Open' | 'Resolved';
  response?: string;
  respondedBy?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  respondedAt?: string;
}

export interface ApplicationHistoryItem {
  action: string;
  performedBy?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  fromStatus?: string;
  toStatus?: string;
  remarks?: string;
  timestamp: string;
}

export interface ApplicationProjectRef {
  _id: string;
  projectName: string;
  companyName: string;
  industry: string;
  district: string;
  location: string;
  pollutionCategory: string;
  investment: number;
  employees: number;
  owner?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    organization?: string;
  };
}

export interface ApplicationItem {
  _id: string;
  applicationNumber: string;
  projectId: ApplicationProjectRef;
  approvalId?: {
    _id?: string;
    approvalName?: string;
    priority?: string;
    estimatedDays?: number;
    inspectionRequired?: boolean;
    department?: string;
    reason?: string;
    requiredDocuments?: string[];
  };
  department: string;
  assignedOfficer?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    department?: string;
    organization?: string;
  };
  status: ApplicationStatus;
  currentStage: string;
  priority: ApplicationPriority;
  slaDays: number;
  submittedAt: string;
  lastUpdated: string;
  inspectionDate?: string;
  remarks?: string;
  serviceName?: string;
  queries: ApplicationQueryItem[];
  history: ApplicationHistoryItem[];
  elapsedDays?: number;
  slaRemaining?: number;
  isOverdue?: boolean;
  riskScore?: RiskLevel;
  documents?: any[];
  inspections?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface OfficerAnalyticsData {
  kpi: {
    pendingApplications: number;
    applicationsDueToday: number;
    slaAtRisk: number;
    todayInspections: number;
    approvedThisMonth: number;
    queriesRaised: number;
  };
  departmentWorkload: Record<string, number>;
  applicationsByStatus: Record<string, number>;
  pendingByDistrict: Record<string, number>;
  averageApprovalDays: number;
}

export interface ApplicationFilterParams {
  department?: string;
  district?: string;
  industry?: string;
  priority?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApplicationsResponse {
  success: boolean;
  data: ApplicationItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
