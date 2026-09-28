import { api } from './api';
import {
  Project,
  ProjectsResponse,
  SingleProjectResponse,
  ProjectFilterParams,
} from '../types/project.types';

export const projectService = {
  /**
   * GET /api/v1/projects with search, sort, filter, pagination
   */
  getProjects: async (params?: ProjectFilterParams): Promise<ProjectsResponse> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.page) cleanParams.page = params.page;
      if (params.limit) cleanParams.limit = params.limit;
      if (params.search) cleanParams.search = params.search;
      if (params.industry && params.industry !== 'ALL') cleanParams.industry = params.industry;
      if (params.district && params.district !== 'ALL') cleanParams.district = params.district;
      if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
      if (params.projectStage && params.projectStage !== 'ALL') cleanParams.projectStage = params.projectStage;
      if (params.sort) cleanParams.sort = params.sort;
    }

    const response = await api.get<any, ProjectsResponse>('/projects', { params: cleanParams });
    return response;
  },

  /**
   * GET /api/v1/projects/:id
   */
  getProject: async (id: string): Promise<Project> => {
    const response = await api.get<any, SingleProjectResponse>(`/projects/${id}`);
    return response.data;
  },

  /**
   * POST /api/v1/projects
   */
  createProject: async (projectData: Partial<Project>): Promise<Project> => {
    const response = await api.post<any, SingleProjectResponse>('/projects', projectData);
    return response.data;
  },

  /**
   * PUT /api/v1/projects/:id
   */
  updateProject: async (id: string, updateData: Partial<Project>): Promise<Project> => {
    const response = await api.put<any, SingleProjectResponse>(`/projects/${id}`, updateData);
    return response.data;
  },

  /**
   * DELETE /api/v1/projects/:id (Soft Delete)
   */
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

export default projectService;
