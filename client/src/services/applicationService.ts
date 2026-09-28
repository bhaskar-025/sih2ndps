import { api } from './api';
import {
  ApplicationItem,
  ApplicationsResponse,
  ApplicationFilterParams,
  OfficerAnalyticsData,
  ApplicationStatus,
} from '../types/officer.types';

export const applicationService = {
  /**
   * GET /api/v1/applications
   */
  getApplications: async (params?: ApplicationFilterParams): Promise<ApplicationsResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.department && params.department !== 'ALL') cleanParams.department = params.department;
      if (params.district && params.district !== 'ALL') cleanParams.district = params.district;
      if (params.industry && params.industry !== 'ALL') cleanParams.industry = params.industry;
      if (params.priority && params.priority !== 'ALL') cleanParams.priority = params.priority;
      if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
      if (params.search) cleanParams.search = params.search;
      if (params.page) cleanParams.page = params.page;
      if (params.limit) cleanParams.limit = params.limit;
    }

    const response = await api.get<any, ApplicationsResponse>('/applications', {
      params: cleanParams,
    });
    return response;
  },

  /**
   * GET /api/v1/applications/:id
   */
  getApplicationById: async (id: string): Promise<ApplicationItem> => {
    const response = await api.get<any, { success: boolean; data: ApplicationItem }>(
      `/applications/${id}`
    );
    return response.data;
  },

  /**
   * POST /api/v1/applications
   */
  createApplication: async (payload: {
    projectId: string;
    approvalId?: string;
    department: string;
    serviceName?: string;
    priority?: string;
    slaDays?: number;
    remarks?: string;
  }): Promise<ApplicationItem> => {
    const response = await api.post<any, { success: boolean; data: ApplicationItem }>(
      '/applications',
      payload
    );
    return response.data;
  },

  /**
   * PATCH /api/v1/applications/:id/status
   */
  updateStatus: async (
    id: string,
    data: { status: ApplicationStatus; remarks?: string; stage?: string }
  ): Promise<ApplicationItem> => {
    const response = await api.patch<any, { success: boolean; data: ApplicationItem }>(
      `/applications/${id}/status`,
      data
    );
    return response.data;
  },

  /**
   * PATCH /api/v1/applications/:id/query
   */
  raiseOrReplyQuery: async (
    id: string,
    data: { queryText?: string; queryId?: string; response?: string }
  ): Promise<ApplicationItem> => {
    const response = await api.patch<any, { success: boolean; data: ApplicationItem }>(
      `/applications/${id}/query`,
      data
    );
    return response.data;
  },

  /**
   * PATCH /api/v1/applications/:id/assign
   */
  assignOfficer: async (id: string, officerId: string): Promise<ApplicationItem> => {
    const response = await api.patch<any, { success: boolean; data: ApplicationItem }>(
      `/applications/${id}/assign`,
      { officerId }
    );
    return response.data;
  },

  /**
   * POST /api/v1/applications/:id/inspection
   */
  scheduleInspection: async (
    id: string,
    data: {
      inspectionDate: string;
      inspectorId?: string;
      remarks?: string;
      checklist?: { item: string; isCompliant: boolean; notes?: string }[];
    }
  ): Promise<any> => {
    const response = await api.post<any, { success: boolean; data: any }>(
      `/applications/${id}/inspection`,
      data
    );
    return response.data;
  },

  /**
   * GET /api/v1/applications/analytics/officer
   */
  getOfficerAnalytics: async (): Promise<OfficerAnalyticsData> => {
    const response = await api.get<any, { success: boolean; data: OfficerAnalyticsData }>(
      '/applications/analytics/officer'
    );
    return response.data;
  },
};

export default applicationService;
