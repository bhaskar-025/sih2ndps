import { api } from './api';

export type ComplianceStatus =
  | 'Upcoming'
  | 'Due Soon'
  | 'Overdue'
  | 'Completed'
  | 'Renewal Pending';

export type CompliancePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ComplianceFrequency = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual' | 'Bi-Annual' | 'One-Time';

export interface ComplianceItem {
  _id: string;
  projectId: any;
  approvalId?: any;
  complianceName: string;
  department: string;
  frequency: ComplianceFrequency;
  lastCompleted?: string;
  nextDueDate: string;
  status: ComplianceStatus;
  priority: CompliancePriority;
  documentsRequired: string[];
  renewalRequired: boolean;
  renewalWindowDays: number;
  penaltyRisk?: string;
  remarks?: string;
  history?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceFilterParams {
  status?: string;
  department?: string;
  priority?: string;
  projectId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ComplianceScoreData {
  projectId?: string;
  totalCompliances: number;
  completedCompliances: number;
  scorePercentage: number;
  statusBreakdown: Record<string, number>;
  penaltyExposureRisk: 'Low' | 'Medium' | 'High';
}

export const complianceService = {
  getCompliances: async (params?: ComplianceFilterParams) => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
      if (params.department && params.department !== 'ALL') cleanParams.department = params.department;
      if (params.priority && params.priority !== 'ALL') cleanParams.priority = params.priority;
      if (params.projectId) cleanParams.projectId = params.projectId;
      if (params.search) cleanParams.search = params.search;
      if (params.page) cleanParams.page = params.page;
      if (params.limit) cleanParams.limit = params.limit;
    }

    const response = await api.get<any, any>('/compliance', { params: cleanParams });
    const items = response.data?.items || (Array.isArray(response.data) ? response.data : []);
    return {
      items: items as ComplianceItem[],
      pagination: response.data?.pagination || response.pagination,
      total: response.data?.total || items.length,
    };
  },

  getProjectCompliances: async (projectId: string): Promise<ComplianceItem[]> => {
    const response = await api.get<any, any>(`/projects/${projectId}/compliance`);
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  },

  getComplianceById: async (id: string): Promise<ComplianceItem> => {
    const response = await api.get<any, any>(`/compliance/${id}`);
    return response.data;
  },

  createCompliance: async (payload: Partial<ComplianceItem>): Promise<ComplianceItem> => {
    const response = await api.post<any, any>('/compliance', payload);
    return response.data;
  },

  updateCompliance: async (id: string, payload: Partial<ComplianceItem>): Promise<ComplianceItem> => {
    const response = await api.put<any, any>(`/compliance/${id}`, payload);
    return response.data;
  },

  updateStatus: async (
    id: string,
    status: ComplianceStatus,
    remarks?: string
  ): Promise<ComplianceItem> => {
    const response = await api.patch<any, any>(`/compliance/${id}/status`, { status, remarks });
    return response.data;
  },

  deleteCompliance: async (id: string): Promise<void> => {
    await api.delete(`/compliance/${id}`);
  },

  getComplianceScore: async (projectId: string): Promise<ComplianceScoreData> => {
    const response = await api.get<any, any>(`/projects/${projectId}/compliance/score`);
    return response.data;
  },

  getReminders: async (projectId?: string): Promise<any[]> => {
    const url = projectId
      ? `/projects/${projectId}/compliance/reminders`
      : '/compliance/reminders';
    const response = await api.get<any, any>(url);
    return Array.isArray(response.data) ? response.data : response.data?.reminders || [];
  },

  getUpcomingRenewals: async (): Promise<ComplianceItem[]> => {
    const response = await api.get<any, any>('/compliance/engine/upcoming-renewals');
    return Array.isArray(response.data) ? response.data : response.data?.items || [];
  },
};

export default complianceService;
