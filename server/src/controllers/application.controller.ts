import { Request, Response } from 'express';
import { WorkflowService } from '../services/workflow.service';

export class ApplicationController {
  /**
   * @route POST /api/v1/applications
   * @desc Submit a new application for a statutory approval
   */
  static async createApplication(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const application = await WorkflowService.createApplication(req.body, user);

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully to Departmental Clearance Workflow',
        data: application,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to submit application',
      });
    }
  }

  /**
   * @route GET /api/v1/applications
   * @desc List applications with department, status, priority, district filters & SLA calculations
   */
  static async getApplications(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const result = await WorkflowService.getApplications(req.query, user);

      res.status(200).json({
        success: true,
        data: result.applications,
        pagination: result.pagination,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch applications',
      });
    }
  }

  /**
   * @route GET /api/v1/applications/analytics/officer
   * @desc Get officer workspace analytics, KPIs, workload distribution
   */
  static async getOfficerAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const analytics = await WorkflowService.getOfficerAnalytics(user);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to calculate officer analytics',
      });
    }
  }

  /**
   * @route GET /api/v1/applications/:id
   * @desc Get comprehensive application dossier with applicant, project, documents, queries & history
   */
  static async getApplicationById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = (req as any).user;
      const application = await WorkflowService.getApplicationById(id, user);

      res.status(200).json({
        success: true,
        data: application,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found')
        ? 404
        : error.message.includes('Unauthorized')
        ? 403
        : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch application details',
      });
    }
  }

  /**
   * @route PUT /api/v1/applications/:id
   * @desc Update application
   */
  static async updateApplication(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = (req as any).user;
      const updated = await WorkflowService.updateStatus(id, req.body, user);

      res.status(200).json({
        success: true,
        message: 'Application updated successfully',
        data: updated,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update application',
      });
    }
  }

  /**
   * @route PATCH /api/v1/applications/:id/status
   * @desc Update application status (Approve, Reject, Under Scrutiny, etc.)
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = (req as any).user;
      const { status, remarks, stage } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Status field is required',
        });
        return;
      }

      const updated = await WorkflowService.updateStatus(id, { status, remarks, stage }, user);

      res.status(200).json({
        success: true,
        message: `Application status transitioned to ${status}`,
        data: updated,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update status',
      });
    }
  }

  /**
   * @route PATCH /api/v1/applications/:id/query
   * @desc Officer raises query or applicant replies to query
   */
  static async raiseOrReplyQuery(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = (req as any).user;
      const updated = await WorkflowService.raiseOrReplyQuery(id, req.body, user);

      res.status(200).json({
        success: true,
        message: req.body.queryText
          ? 'Query successfully raised and notified to applicant'
          : 'Query response submitted',
        data: updated,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to process query',
      });
    }
  }

  /**
   * @route PATCH /api/v1/applications/:id/assign
   * @desc Assign officer to application
   */
  static async assignOfficer(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = (req as any).user;
      const { officerId } = req.body;

      if (!officerId) {
        res.status(400).json({
          success: false,
          message: 'officerId is required',
        });
        return;
      }

      const updated = await WorkflowService.assignOfficer(id, officerId, user);

      res.status(200).json({
        success: true,
        message: 'Officer assigned successfully',
        data: updated,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to assign officer',
      });
    }
  }

  /**
   * @route POST /api/v1/applications/:id/inspection
   * @desc Schedule field inspection with inspector assignment and checklist
   */
  static async scheduleInspection(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = (req as any).user;
      const result = await WorkflowService.scheduleInspection(id, req.body, user);

      res.status(200).json({
        success: true,
        message: 'Field inspection scheduled successfully',
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to schedule inspection',
      });
    }
  }
}

export default ApplicationController;
