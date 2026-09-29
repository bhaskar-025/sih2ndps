import { Request, Response } from 'express';
import { AICopilotService } from '../services/ai/aiCopilot.service';
import { ApiResponse } from '../utils/apiResponse';
import { Logger } from '../utils/logger';

export class CopilotController {
  /**
   * @route POST /api/v1/ai/copilot/action
   * @desc Dispatch one of 8 AI Copilot actions
   */
  static async executeAction(req: Request, res: Response): Promise<void> {
    try {
      const { action, prompt, applicationId, projectId, contextData } = req.body;
      if (!action) {
        res.status(400).json({ success: false, message: 'action is required' });
        return;
      }

      Logger.info(`AI Copilot Action invoked: ${action} for application: ${applicationId}`);
      const result = await AICopilotService.executeCopilotAction({
        action,
        prompt,
        applicationId,
        projectId,
        contextData,
      });

      ApiResponse.success(res, result, 'AI Copilot response generated');
    } catch (error: any) {
      Logger.error(`Error in CopilotController: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to execute AI Copilot action',
      });
    }
  }
}

export default CopilotController;
