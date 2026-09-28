import { api } from './api';

export interface AuditLogItem {
  _id: string;
  user: any;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface WorkflowTransitionItem {
  action: string;
  performedBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  } | null;
  fromStatus?: string;
  toStatus?: string;
  fromStage?: string;
  toStage?: string;
  remarks?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  durationInPreviousStageFormatted?: string;
}

export interface WorkflowHistoryData {
  application: any;
  slaAnalytics: {
    slaDays: number;
    elapsedDays: number;
    remainingDays: number;
    isBreached: boolean;
    urgencyLevel: 'Normal' | 'Approaching Deadline' | 'Overdue';
  };
  totalTransitions: number;
  stateTransitions: WorkflowTransitionItem[];
  auditTrail: AuditLogItem[];
  queries: any[];
}

export const analyticsService = {
  /**
   * Officer Analytics (Department workload, SLA at risk, inspections today)
   */
  getOfficerAnalytics: async () => {
    try {
      const response = await api.get<any, any>('/applications/analytics/officer');
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Audit Logs list with filtering
   */
  getAuditLogs: async (params?: {
    entity?: string;
    action?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.entity && params.entity !== 'ALL') cleanParams.entity = params.entity;
      if (params.action && params.action !== 'ALL') cleanParams.action = params.action;
      if (params.search) cleanParams.search = params.search;
      if (params.page) cleanParams.page = params.page;
      if (params.limit) cleanParams.limit = params.limit;
    }

    const response = await api.get<any, any>('/audit', { params: cleanParams });
    const items = response.data?.items || (Array.isArray(response.data) ? response.data : []);
    return {
      items: items as AuditLogItem[],
      pagination: response.data?.pagination || response.pagination,
      total: response.data?.total || items.length,
    };
  },

  /**
   * Audit statistics & entity breakdown
   */
  getAuditStats: async () => {
    const response = await api.get<any, any>('/audit/stats');
    return response.data;
  },

  /**
   * Workflow state transition lifecycle for an application
   */
  getWorkflowHistory: async (applicationId: string): Promise<WorkflowHistoryData> => {
    const response = await api.get<any, any>(`/workflow/${applicationId}`);
    return response.data;
  },

  /**
   * General dashboard metrics synthesized from real backend modules
   */
  getOverviewMetrics: async () => {
    try {
      const [knowledgeRes, auditStatsRes, officerRes] = await Promise.allSettled([
        api.get<any, any>('/knowledge'),
        api.get<any, any>('/audit/stats'),
        api.get<any, any>('/applications/analytics/officer'),
      ]);

      const knowledge = knowledgeRes.status === 'fulfilled' ? knowledgeRes.value?.data : null;
      const auditStats = auditStatsRes.status === 'fulfilled' ? auditStatsRes.value?.data : null;
      const officer = officerRes.status === 'fulfilled' ? officerRes.value?.data : null;

      return {
        knowledge,
        auditStats,
        officer,
      };
    } catch {
      return null;
    }
  },
};

export default analyticsService;
