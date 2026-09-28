import { api } from './api';

export interface InspectionChecklistItem {
  _id?: string;
  item: string;
  isCompliant: boolean;
  notes?: string;
}

export interface InspectionItem {
  _id: string;
  project: any;
  application?: any;
  department: string;
  assignedInspector: any;
  inspectionDate: string;
  inspectionTime?: string;
  inspectionType: string;
  status: 'Scheduled' | 'Rescheduled' | 'Completed' | 'Cancelled';
  remarks?: string;
  findings?: string;
  documentsVerified: string[];
  photos: string[];
  location: string;
  checklists?: InspectionChecklistItem[];
  history?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface InspectionFilterParams {
  status?: string;
  department?: string;
  projectId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface InspectionsResponse {
  success: boolean;
  data: InspectionItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const inspectionService = {
  getInspections: async (params?: InspectionFilterParams): Promise<InspectionsResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
      if (params.department && params.department !== 'ALL') cleanParams.department = params.department;
      if (params.projectId) cleanParams.project = params.projectId;
      if (params.search) cleanParams.search = params.search;
      if (params.page) cleanParams.page = params.page;
      if (params.limit) cleanParams.limit = params.limit;
    }

    const response = await api.get<any, any>('/inspections', { params: cleanParams });
    return {
      success: response.success ?? true,
      data: Array.isArray(response.data) ? response.data : response.data?.items || [],
      pagination: response.pagination || response.data?.pagination,
    };
  },

  getInspectionById: async (id: string): Promise<InspectionItem> => {
    const response = await api.get<any, any>(`/inspections/${id}`);
    return response.data;
  },

  scheduleInspection: async (payload: Partial<InspectionItem>): Promise<InspectionItem> => {
    const response = await api.post<any, any>('/inspections', payload);
    return response.data;
  },

  updateInspection: async (id: string, payload: Partial<InspectionItem>): Promise<InspectionItem> => {
    const response = await api.put<any, any>(`/inspections/${id}`, payload);
    return response.data;
  },

  updateStatus: async (
    id: string,
    status: string,
    findings?: string,
    remarks?: string
  ): Promise<InspectionItem> => {
    const response = await api.patch<any, any>(`/inspections/${id}/status`, {
      status,
      findings,
      remarks,
    });
    return response.data;
  },

  rescheduleInspection: async (
    id: string,
    newDate: string,
    newTime?: string,
    reason?: string
  ): Promise<InspectionItem> => {
    const response = await api.patch<any, any>(`/inspections/${id}/reschedule`, {
      inspectionDate: newDate,
      inspectionTime: newTime,
      reason,
    });
    return response.data;
  },

  cancelInspection: async (id: string, reason: string): Promise<InspectionItem> => {
    const response = await api.patch<any, any>(`/inspections/${id}/cancel`, { reason });
    return response.data;
  },

  deleteInspection: async (id: string): Promise<void> => {
    await api.delete(`/inspections/${id}`);
  },
};

export default inspectionService;
