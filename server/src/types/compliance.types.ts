import {
  ComplianceStatus,
  CompliancePriority,
  PenaltyRisk,
  ComplianceFrequency,
  ICompliance,
} from '../models/Compliance';

export { ComplianceStatus, CompliancePriority, PenaltyRisk, ComplianceFrequency };

export interface ComplianceFilterParams {
  projectId?: string;
  department?: string;
  status?: ComplianceStatus | 'ALL';
  priority?: CompliancePriority | 'ALL';
  penaltyRisk?: PenaltyRisk | 'ALL';
  renewalRequired?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface CreateComplianceDTO {
  projectId: string;
  approvalId?: string;
  complianceName: string;
  department: string;
  frequency?: ComplianceFrequency;
  lastCompleted?: string | Date;
  nextDueDate: string | Date;
  priority?: CompliancePriority;
  documentsRequired?: string[];
  renewalRequired?: boolean;
  renewalWindowDays?: number;
  penaltyRisk?: PenaltyRisk;
  remarks?: string;
}

export interface UpdateComplianceDTO {
  complianceName?: string;
  department?: string;
  frequency?: ComplianceFrequency;
  lastCompleted?: string | Date;
  nextDueDate?: string | Date;
  priority?: CompliancePriority;
  documentsRequired?: string[];
  renewalRequired?: boolean;
  renewalWindowDays?: number;
  penaltyRisk?: PenaltyRisk;
  remarks?: string;
}

export interface UpdateComplianceStatusDTO {
  status: ComplianceStatus;
  remarks?: string;
  completionDate?: string | Date;
  nextDueDate?: string | Date; // optional: auto-scheduled by frequency if omitted on completion
}

export interface ComplianceScoreResult {
  scorePercentage: number;
  totalCompliances: number;
  completedCount: number;
  upcomingCount: number;
  dueSoonCount: number;
  renewalPendingCount: number;
  overdueCount: number;
  penaltyRiskBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  statusBreakdown: Record<ComplianceStatus, number>;
  rating: 'AAA - Exemplary' | 'AA - Strong' | 'A - Compliant' | 'B - At Risk' | 'C - Non-Compliant';
  summary: string;
  computedAt: string;
}

export type ReminderType = '30_DAYS' | '15_DAYS' | '7_DAYS' | '1_DAY' | 'OVERDUE';

export interface ComplianceReminder {
  complianceId: string;
  complianceName: string;
  projectId: string;
  projectName: string;
  companyName: string;
  department: string;
  nextDueDate: Date;
  daysRemaining: number;
  reminderType: ReminderType;
  urgency: CompliancePriority;
  penaltyRisk: PenaltyRisk;
  message: string;
  actionRequired: string;
  documentsRequired: string[];
}

export interface EngineEvaluationResult {
  evaluatedCount: number;
  updatedCount: number;
  statusTransitions: {
    id: string;
    name: string;
    from: string;
    to: string;
    reason: string;
  }[];
  upcomingRenewalsCount: number;
  dueIn30DaysCount: number;
  expiredCount: number;
  evaluatedAt: string;
}
