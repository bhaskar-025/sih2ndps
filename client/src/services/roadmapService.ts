import { api } from './api';
import {
  RoadmapData,
  RoadmapResponse,
  ProjectApprovalItem,
  SingleApprovalResponse,
  ProjectApprovalStatus,
} from '../types/roadmap.types';

export const roadmapService = {
  /**
   * POST /api/v1/projects/:id/generate-roadmap
   * Runs the Approval Intelligence Engine to evaluate rules and persist the statutory roadmap.
   */
  generateRoadmap: async (projectId: string): Promise<RoadmapData> => {
    const response = await api.post<any, RoadmapResponse>(`/projects/${projectId}/generate-roadmap`);
    return response.data;
  },

  /**
   * GET /api/v1/projects/:id/roadmap
   * Retrieves the current persisted roadmap for the project.
   */
  getRoadmap: async (projectId: string): Promise<RoadmapData> => {
    const response = await api.get<any, RoadmapResponse>(`/projects/${projectId}/roadmap`);
    return response.data;
  },

  /**
   * PUT /api/v1/approvals/:id/status
   * Updates an approval record's status.
   */
  updateApprovalStatus: async (
    approvalId: string,
    status: ProjectApprovalStatus
  ): Promise<ProjectApprovalItem> => {
    const response = await api.put<any, SingleApprovalResponse>(`/approvals/${approvalId}/status`, {
      status,
    });
    return response.data;
  },
};

export default roadmapService;
