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
   * POST /api/v1/ai/generate-roadmap
   * Runs the AI Approval Intelligence Engine (Gemini 2.5 Flash).
   * If Generate is clicked again, regenerates the roadmap.
   */
  generateRoadmap: async (projectId: string): Promise<RoadmapData> => {
    const response = await api.post<any, RoadmapResponse>('/ai/generate-roadmap', {
      projectId,
      regenerate: true,
    });
    return response.data;
  },

  /**
   * GET /api/v1/ai/roadmap/:projectId
   * Retrieves the cached statutory roadmap for the project.
   */
  getRoadmap: async (projectId: string): Promise<RoadmapData> => {
    try {
      const response = await api.get<any, RoadmapResponse>(`/ai/roadmap/${projectId}`);
      return response.data;
    } catch {
      const response = await api.get<any, RoadmapResponse>(`/projects/${projectId}/roadmap`);
      return response.data;
    }
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

  /**
   * POST /api/v1/ai/generate-roadmap
   * AI Approval Intelligence Engine endpoint
   */
  aiGenerateRoadmap: async (projectId: string): Promise<RoadmapData> => {
    const response = await api.post<any, RoadmapResponse>('/ai/generate-roadmap', { projectId });
    return response.data;
  },

  /**
   * POST /api/v1/ai/regenerate-roadmap/:projectId
   * AI Approval Intelligence Engine regeneration endpoint
   */
  aiRegenerateRoadmap: async (projectId: string): Promise<RoadmapData> => {
    const response = await api.post<any, RoadmapResponse>(`/ai/regenerate-roadmap/${projectId}`);
    return response.data;
  },
};

export default roadmapService;
