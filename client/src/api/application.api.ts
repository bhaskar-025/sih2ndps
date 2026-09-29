import { apiClient } from './client';
import mockApplicationsData from './mockData/mockApplications.json';

export interface ApplicationQueryParams {
  stage?: string;
  department?: string;
  priority?: string;
  risk?: string;
  search?: string;
  district?: string;
  industry?: string;
  page?: number;
  limit?: number;
}

export const applicationApi = {
  /**
   * Fetches paginated, filtered applications list
   */
  async getApplications(params?: ApplicationQueryParams): Promise<{ data: any[]; total: number }> {
    return apiClient.executeWithFallback(
      () => apiClient.get('/applications', { params }),
      () => {
        let list = [...mockApplicationsData];
        if (params?.search) {
          const q = params.search.toLowerCase();
          list = list.filter(
            (a) =>
              a.applicationNumber.toLowerCase().includes(q) ||
              a.serviceName.toLowerCase().includes(q) ||
              a.projectId?.projectName.toLowerCase().includes(q) ||
              a.department.toLowerCase().includes(q)
          );
        }
        if (params?.department && params.department !== 'ALL') {
          list = list.filter((a) => a.department === params.department);
        }
        if (params?.stage && params.stage !== 'ALL') {
          list = list.filter((a) => a.status === params.stage);
        }
        if (params?.priority && params.priority !== 'ALL') {
          list = list.filter((a) => a.priority === params.priority);
        }
        if (params?.risk && params.risk !== 'ALL') {
          list = list.filter((a) => a.riskScore === params.risk);
        }
        if (params?.district && params.district !== 'ALL') {
          list = list.filter((a) => a.projectId?.district === params.district);
        }
        if (params?.industry && params.industry !== 'ALL') {
          list = list.filter((a) => a.projectId?.industry === params.industry);
        }
        return { data: list, total: list.length };
      },
      'applications'
    );
  },

  /**
   * Fetches application dossier by ID
   */
  async getApplicationById(id: string): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.get(`/applications/${id}`),
      () => {
        const found = mockApplicationsData.find((a) => a._id === id);
        return found || mockApplicationsData[0];
      },
      `applications/${id}`
    );
  },

  /**
   * Updates application lifecycle stage
   */
  async updateStatus(id: string, data: { status: string; remarks?: string }): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.patch(`/applications/${id}/status`, data),
      () => {
        const item = mockApplicationsData.find((a) => a._id === id) || mockApplicationsData[0];
        return { ...item, status: data.status, remarks: data.remarks, updatedAt: new Date().toISOString() };
      },
      `applications/${id}/status`
    );
  },

  /**
   * Assigns application to an officer
   */
  async assignOfficer(appId: string, officerId: string): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.post(`/officer/applications/${appId}/assign`, { officerId }),
      () => ({ success: true, message: 'Assigned successfully' }),
      `officer/applications/${appId}/assign`
    );
  },

  /**
   * Forwards application to another statutory department
   */
  async forwardDepartment(appId: string, toDepartment: string, remarks?: string): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.post(`/officer/applications/${appId}/forward`, { toDepartment, remarks }),
      () => ({ success: true, message: 'Forwarded successfully' }),
      `officer/applications/${appId}/forward`
    );
  },

  /**
   * Escalates application due to SLA pressure or non-compliance
   */
  async escalateApplication(appId: string, reason: string): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.post(`/officer/applications/${appId}/escalate`, { reason }),
      () => ({ success: true, escalated: true, reason }),
      `officer/applications/${appId}/escalate`
    );
  },

  /**
   * Raises a formal clarification query or logs entrepreneur response
   */
  async raiseOrReplyQuery(
    appId: string,
    data: { queryText?: string; queryId?: string; response?: string }
  ): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.post(`/applications/${appId}/query`, data),
      () => ({ success: true, queryLogged: true }),
      `applications/${appId}/query`
    );
  },

  /**
   * Approves application and generates statutory Clearance Certificate / NOC
   */
  async generateNoc(appId: string, remarks?: string): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.post(`/officer/applications/${appId}/generate-noc`, { remarks }),
      () => ({
        success: true,
        certificateNumber: `MH-NOC-${Date.now().toString().slice(-6)}`,
        status: 'Approved',
        certificateIssuedAt: new Date().toISOString(),
      }),
      `officer/applications/${appId}/generate-noc`
    );
  },

  /**
   * Returns application to entrepreneur for rectifications
   */
  async returnApplication(appId: string, reason: string): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.post(`/officer/applications/${appId}/return`, { reason }),
      () => ({ success: true, status: 'Returned', returnReason: reason }),
      `officer/applications/${appId}/return`
    );
  },

  /**
   * Appends private departmental scrutiny note to application dossier
   */
  async addOfficerNote(appId: string, note: string): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.post(`/officer/applications/${appId}/notes`, { note }),
      () => ({ success: true, note, createdAt: new Date().toISOString() }),
      `officer/applications/${appId}/notes`
    );
  },
};

export const getApplications = applicationApi.getApplications;
export const getApplicationById = applicationApi.getApplicationById;
