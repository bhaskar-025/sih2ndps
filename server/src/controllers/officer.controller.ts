import { Request, Response } from 'express';
import { OfficerService } from '../services/officer.service';
import { ApiResponse } from '../utils/apiResponse';
import { Logger } from '../utils/logger';

export class OfficerController {
  /**
   * @route GET /api/v1/officer/dashboard-analytics
   * @desc Get dynamic live analytics, KPIs, queue segregation, district/industry breakdown
   */
  static async getDashboardAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const data = await OfficerService.getLiveDashboardAnalytics(user);
      ApiResponse.success(res, data, 'Officer dashboard analytics retrieved successfully');
    } catch (error: any) {
      Logger.error(`Error in getDashboardAnalytics: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to load officer analytics',
      });
    }
  }

  /**
   * @route GET /api/v1/officer/officers-list
   * @desc Get all registered scrutinizing officers with active caseload
   */
  static async getOfficersList(_req: Request, res: Response): Promise<void> {
    try {
      const officers = await OfficerService.getOfficersList();
      ApiResponse.success(res, officers, 'Officers list retrieved');
    } catch (error: any) {
      Logger.error(`Error in getOfficersList: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to load officers list',
      });
    }
  }

  /**
   * @route POST /api/v1/officer/assign
   * @desc Assign an officer to an application
   */
  static async assignOfficer(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId, officerId } = req.body;
      if (!applicationId || !officerId) {
        res.status(400).json({ success: false, message: 'applicationId and officerId are required' });
        return;
      }

      const user = (req as any).user;
      const updated = await OfficerService.assignOfficer(applicationId, officerId, user);
      ApiResponse.success(res, updated, 'Officer assigned successfully');
    } catch (error: any) {
      Logger.error(`Error in assignOfficer: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to assign officer',
      });
    }
  }

  /**
   * @route POST /api/v1/officer/forward
   * @desc Forward application to another department
   */
  static async forwardDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId, targetDepartment, remarks } = req.body;
      if (!applicationId || !targetDepartment) {
        res.status(400).json({ success: false, message: 'applicationId and targetDepartment are required' });
        return;
      }

      const user = (req as any).user;
      const updated = await OfficerService.forwardDepartment(applicationId, targetDepartment, remarks, user);
      ApiResponse.success(res, updated, `Application forwarded to ${targetDepartment}`);
    } catch (error: any) {
      Logger.error(`Error in forwardDepartment: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to forward application',
      });
    }
  }

  /**
   * @route POST /api/v1/officer/generate-noc
   * @desc Issue official digital NOC certificate for application
   */
  static async generateNoc(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId, remarks } = req.body;
      if (!applicationId) {
        res.status(400).json({ success: false, message: 'applicationId is required' });
        return;
      }

      const user = (req as any).user;
      const noc = await OfficerService.generateNoc(applicationId, remarks, user);
      ApiResponse.success(res, noc, 'NOC Certificate generated and digitally issued successfully');
    } catch (error: any) {
      Logger.error(`Error in generateNoc: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate NOC',
      });
    }
  }

  /**
   * @route POST /api/v1/officer/notes
   * @desc Add internal officer note
   */
  static async addOfficerNote(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId, note } = req.body;
      if (!applicationId || !note) {
        res.status(400).json({ success: false, message: 'applicationId and note are required' });
        return;
      }

      const user = (req as any).user;
      const notes = await OfficerService.addOfficerNote(applicationId, note, user?.name, user?.userId || user?._id);
      ApiResponse.success(res, notes, 'Officer note added');
    } catch (error: any) {
      Logger.error(`Error in addOfficerNote: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add note',
      });
    }
  }

  /**
   * @route POST /api/v1/officer/return
   * @desc Return application to applicant for resubmission
   */
  static async returnApplication(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId, reason } = req.body;
      if (!applicationId || !reason) {
        res.status(400).json({ success: false, message: 'applicationId and reason are required' });
        return;
      }

      const user = (req as any).user;
      const updated = await OfficerService.returnApplication(applicationId, reason, user);
      ApiResponse.success(res, updated, 'Application returned to applicant for resubmission');
    } catch (error: any) {
      Logger.error(`Error in returnApplication: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to return application',
      });
    }
  }
}

export default OfficerController;
