import { apiClient } from './client';
import mockProjectsData from './mockData/mockProjects.json';
import mockApplicationsData from './mockData/mockApplications.json';
import mockDocumentsData from './mockData/mockDocuments.json';

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  district?: string;
  industry?: string;
  status?: string;
  sort?: string;
}

export const projectApi = {
  /**
   * Fetches industrial units registry with search, filter, sort and pagination
   */
  async getProjects(params?: ProjectQueryParams): Promise<{
    data: any[];
    total: number;
    page: number;
    pages: number;
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return apiClient.executeWithFallback(
      async () => {
        const response = await apiClient.get('/projects', { params });
        const resData = response.data as any;
        const list = Array.isArray(resData?.data) ? resData.data : Array.isArray(resData) ? resData : [];
        const pag = resData?.pagination || {
          total: list.length,
          page: params?.page || 1,
          limit: params?.limit || 10,
          totalPages: Math.ceil(list.length / (params?.limit || 10)) || 1,
        };
        return {
          data: list,
          total: pag.total,
          page: pag.page,
          pages: pag.totalPages,
          pagination: pag,
        };
      },
      () => {
        let list = [...mockProjectsData];
        if (params?.search) {
          const q = params.search.toLowerCase();
          list = list.filter(
            (p) =>
              p.projectName.toLowerCase().includes(q) ||
              p.companyName.toLowerCase().includes(q) ||
              p.district.toLowerCase().includes(q) ||
              p.industry.toLowerCase().includes(q)
          );
        }
        if (params?.district && params.district !== 'ALL') {
          list = list.filter((p) => p.district === params.district);
        }
        if (params?.industry && params.industry !== 'ALL') {
          list = list.filter((p) => p.industry === params.industry);
        }
        if (params?.status && params.status !== 'ALL') {
          list = list.filter((p) => p.status === params.status);
        }

        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const start = (page - 1) * limit;
        const paginated = list.slice(start, start + limit);
        const totalPages = Math.ceil(list.length / limit) || 1;

        return {
          data: paginated,
          total: list.length,
          page,
          pages: totalPages,
          pagination: {
            total: list.length,
            page,
            limit,
            totalPages,
          },
        };
      },
      'projects'
    );
  },

  /**
   * Fetches single industrial unit by ID
   */
  async getProjectById(id: string): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.get(`/projects/${id}`),
      () => {
        const found = mockProjectsData.find((p) => p._id === id);
        return found || mockProjectsData[0];
      },
      `projects/${id}`
    );
  },

  /**
   * Fetches linked statutory clearances for a project
   */
  async getProjectApprovals(projectId: string): Promise<any[]> {
    return apiClient.executeWithFallback(
      () => apiClient.get(`/projects/${projectId}/approvals`),
      () => {
        return mockApplicationsData.filter(
          (a: any) => a.projectId?._id === projectId || a.projectId === projectId
        );
      },
      `projects/${projectId}/approvals`
    );
  },

  /**
   * Fetches linked documents for a project
   */
  async getProjectDocuments(projectId: string): Promise<any[]> {
    return apiClient.executeWithFallback(
      () => apiClient.get(`/projects/${projectId}/documents`),
      () => {
        return mockDocumentsData.filter((d) => d.projectId === projectId);
      },
      `projects/${projectId}/documents`
    );
  },
};

export const getProjects = projectApi.getProjects;
export const getProjectById = projectApi.getProjectById;
