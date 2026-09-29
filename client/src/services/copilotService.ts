import { api } from './api';

export type CopilotActionType =
  | 'ask_copilot'
  | 'summarize_application'
  | 'find_missing_documents'
  | 'suggest_approval'
  | 'predict_approval_probability'
  | 'similar_past_projects'
  | 'generate_inspection_checklist'
  | 'draft_query'
  | 'generate_remarks';

export interface CopilotResponse {
  action: CopilotActionType;
  title: string;
  answer?: string;
  summary?: string;
  recommendation?: string;
  confidence?: number;
  rationale?: string;
  probability?: number;
  riskLevel?: string;
  factors?: { factor: string; impact: string; weight: number }[];
  missingCount?: number;
  missingDocuments?: any[];
  healthScore?: number;
  similarProjects?: any[];
  items?: { item: string; standard: string; priority: string }[];
  draftText?: string;
  remarks?: string;
  conditions?: string[];
  suggestedNextStage?: string;
  source?: 'gemini-2.5-flash' | 'ai-regulatory-engine';
}

export const copilotService = {
  /**
   * Execute 1-click or freeform prompt AI Copilot action on an application or project
   */
  executeAction: async (
    action: CopilotActionType,
    options?: { applicationId?: string; projectId?: string; prompt?: string; contextData?: any }
  ): Promise<CopilotResponse> => {
    const response = await api.post<any, { success: boolean; data: CopilotResponse }>(
      '/ai/copilot/action',
      {
        action,
        prompt: options?.prompt,
        applicationId: options?.applicationId,
        projectId: options?.projectId,
        contextData: options?.contextData,
      }
    );
    return response.data;
  },
};

export default copilotService;
