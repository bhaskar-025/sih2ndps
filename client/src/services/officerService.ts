import { api } from './api';

export interface OfficerDashboardAnalytics {
  kpi: {
    pendingScrutiny: number;
    applicationsToday: number;
    queriesRaised: number;
    approvalsIssued: number;
    rejected: number;
    returned: number;
    averageSlaRemaining: number;
    inspectionsScheduled: number;
    departmentsActive: number;
    totalApplications: number;
  };
  officerWorkload: {
    officerId: string;
    name: string;
    email: string;
    department: string;
    activeCases: number;
    phone?: string;
  }[];
  queues: {
    priorityQueue: any[];
    todayTasks: any[];
    assignedCases: any[];
    unassignedCases: any[];
    escalatedCases: any[];
    highRiskCases: any[];
    pendingQueries: any[];
    returnedFiles: any[];
    approvalsReady: any[];
  };
  charts: {
    districtBreakdown: { district: string; count: number }[];
    industryBreakdown: { industry: string; count: number }[];
    statusBreakdown: { status: string; count: number }[];
  };
  recentActivity: {
    applicationId: string;
    applicationNumber: string;
    projectName: string;
    department: string;
    action: string;
    remarks?: string;
    fromStatus?: string;
    toStatus?: string;
    timestamp: string;
  }[];
}

export interface DepartmentRegistryItem {
  _id: string;
  name: string;
  code: string;
  description: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  officeAddress?: string;
  approvalTypes: string[];
  officerCount: number;
  pendingCases: number;
  completedCases: number;
  averageSla: number;
  performancePercent: number;
  jurisdiction: string;
  isActive: boolean;
}

export const officerService = {
  /**
   * Get dynamic officer dashboard analytics & queues
   */
  getDashboardAnalytics: async (department = 'ALL'): Promise<OfficerDashboardAnalytics> => {
    const response = await api.get<any, { success: boolean; data: OfficerDashboardAnalytics }>(
      '/officer/dashboard-analytics',
      { params: { department } }
    );
    return response.data;
  },

  /**
   * Get list of officers for assignments
   */
  getOfficersList: async (): Promise<any[]> => {
    const response = await api.get<any, { success: boolean; data: any[] }>('/officer/officers-list');
    return response.data || [];
  },

  /**
   * Assign officer to an application
   */
  assignOfficer: async (applicationId: string, officerId: string): Promise<any> => {
    const response = await api.post<any, { success: boolean; data: any }>('/officer/assign', {
      applicationId,
      officerId,
    });
    return response.data;
  },

  /**
   * Forward application to another department
   */
  forwardDepartment: async (applicationId: string, targetDepartment: string, remarks?: string): Promise<any> => {
    const response = await api.post<any, { success: boolean; data: any }>('/officer/forward', {
      applicationId,
      targetDepartment,
      remarks,
    });
    return response.data;
  },

  /**
   * Generate official digital NOC certificate
   */
  generateNoc: async (applicationId: string, remarks?: string): Promise<any> => {
    const response = await api.post<any, { success: boolean; data: any }>('/officer/generate-noc', {
      applicationId,
      remarks,
    });
    return response.data;
  },

  /**
   * Add internal officer note
   */
  addOfficerNote: async (applicationId: string, note: string): Promise<any> => {
    const response = await api.post<any, { success: boolean; data: any }>('/officer/notes', {
      applicationId,
      note,
    });
    return response.data;
  },

  /**
   * Return application to applicant for resubmission
   */
  returnApplication: async (applicationId: string, reason: string): Promise<any> => {
    const response = await api.post<any, { success: boolean; data: any }>('/officer/return', {
      applicationId,
      reason,
    });
    return response.data;
  },

  /**
   * Get Government Department Registry with live SLA & officer metrics
   */
  getDepartments: async (): Promise<DepartmentRegistryItem[]> => {
    const response = await api.get<any, { success: boolean; data: DepartmentRegistryItem[] }>('/departments');
    return response.data || [];
  },

  getDepartmentRegistry: async (): Promise<DepartmentRegistryItem[]> => {
    const response = await api.get<any, { success: boolean; data: DepartmentRegistryItem[] }>('/departments');
    return response.data || [];
  },

  /**
   * Export applications, units, or inspections to CSV
   */
  exportReport: async (type: 'applications' | 'projects' | 'inspections'): Promise<void> => {
    const token = localStorage.getItem('maitri_token');
    const url = `/api/v1/reports/export/${type}`;
    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `maitri_${type}_export_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  exportData: async (type: 'applications' | 'projects' | 'inspections', _format = 'csv'): Promise<void> => {
    const token = localStorage.getItem('maitri_token');
    const url = `/api/v1/reports/export/${type}`;
    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `maitri_${type}_export_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  /**
   * Get state industrial intelligence summary report
   */
  getSummaryReport: async (): Promise<any> => {
    const response = await api.get<any, { success: boolean; data: any }>('/reports/summary');
    return response.data;
  },
};

export default officerService;
