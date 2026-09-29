import { apiClient } from './client';
import mockDashboardData from './mockData/mockDashboard.json';
import mockApplicationsData from './mockData/mockApplications.json';
import mockInspectionsData from './mockData/mockInspections.json';

export interface DashboardMetrics {
  pendingReviews: number;
  pendingScrutiny?: number;
  approvedToday: number;
  approvalsIssued?: number;
  rejected: number;
  queriesRaised: number;
  applicationsWaiting: number;
  averageSla: number;
  averageSlaRemaining?: number;
  inspectionToday: number;
  inspectionsScheduled?: number;
  totalProjects: number;
  todaysDeadline: number;
  overdue: number;
  highRiskApplications: number;
  departmentsActive: number;
  totalApplications: number;
}

export interface OfficerDashboardResponse {
  kpi: DashboardMetrics;
  charts: {
    districtBreakdown: { district: string; count: number }[];
    industryBreakdown: { industry: string; count: number }[];
    monthlyTrend: { month: string; submitted: number; approved: number; rejected: number }[];
    statusBreakdown?: { status: string; count: number }[];
  };
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
  officerWorkload: {
    officerId: string;
    name: string;
    email: string;
    department: string;
    role: string;
    activeCases: number;
    completedCases: number;
    avgSlaDays: number;
    clearanceRate: number;
    phone?: string;
  }[];
  recentActivity?: any[];
}

export const dashboardApi = {
  /**
   * Fetches live officer workspace dashboard metrics and queues.
   * Dynamically aggregates KPIs from real backend API or mock fallback.
   */
  async getDashboard(department: string = 'ALL'): Promise<OfficerDashboardResponse> {
    return apiClient.executeWithFallback<OfficerDashboardResponse>(
      () => apiClient.get('/officer/dashboard-analytics', { params: { department } }),
      () => {
        // Derive dynamic metrics from mock datasets
        const apps = mockApplicationsData;
        const insps = mockInspectionsData;

        const pendingReviews = apps.filter(
          (a) => a.status === 'Submitted' || a.status === 'Under Scrutiny' || a.status === 'Document Verification'
        ).length;
        const approvedToday = apps.filter((a) => a.status === 'Approved').length;
        const rejected = apps.filter((a) => a.status === 'Rejected').length;
        const queriesRaised = apps.reduce((acc, a) => acc + (a.queries?.length || 0), 0);
        const applicationsWaiting = apps.filter((a) => !a.assignedOfficer).length;
        const overdue = apps.filter((a) => a.isOverdue || (a.slaRemaining !== undefined && a.slaRemaining <= 0)).length;
        const highRisk = apps.filter((a) => a.riskScore === 'High' || a.priority === 'Critical').length;
        const todayDateStr = new Date().toISOString().split('T')[0];
        const inspectionToday = insps.filter((i) => i.scheduledDate.startsWith(todayDateStr) || i.status === 'Scheduled').length;
        const avgSla = Math.round(
          apps.reduce((acc, a) => acc + (a.slaRemaining || 15), 0) / (apps.length || 1)
        );

        return {
          kpi: {
            pendingReviews,
            approvedToday,
            rejected,
            queriesRaised,
            applicationsWaiting,
            averageSla: avgSla,
            inspectionToday,
            totalProjects: 6,
            todaysDeadline: apps.filter((a) => a.slaRemaining !== undefined && a.slaRemaining <= 3).length,
            overdue,
            highRiskApplications: highRisk,
            departmentsActive: 8,
            totalApplications: apps.length,
          },
          charts: mockDashboardData.charts,
          queues: {
            priorityQueue: apps.filter((a) => a.priority === 'High' || a.priority === 'Critical'),
            todayTasks: apps.slice(0, 3),
            assignedCases: apps.filter((a) => !!a.assignedOfficer),
            unassignedCases: apps.filter((a) => !a.assignedOfficer),
            escalatedCases: apps.filter((a) => a.escalated || a.isOverdue),
            highRiskCases: apps.filter((a) => a.riskScore === 'High'),
            pendingQueries: apps.filter((a) => a.queries && a.queries.some((q) => q.status === 'Pending')),
            returnedFiles: apps.filter((a) => a.status === 'Returned'),
            approvalsReady: apps.filter((a) => a.status === 'Approved'),
          },
          officerWorkload: mockDashboardData.officerWorkload,
        };
      },
      'officer/dashboard-analytics'
    );
  },

  /**
   * Fetches district-level and industry-level clearance analytics
   */
  async getAnalytics(): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.get('/analytics/overview'),
      () => mockDashboardData.charts,
      'analytics/overview'
    );
  },
};

export const getDashboard = dashboardApi.getDashboard;
export const getAnalytics = dashboardApi.getAnalytics;
