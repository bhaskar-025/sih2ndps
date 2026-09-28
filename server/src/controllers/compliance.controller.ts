import { Request, Response, NextFunction } from 'express';
import { complianceService } from '../services/compliance.service';
import { complianceEngineService } from '../services/complianceEngine.service';
import { reminderService } from '../services/reminder.service';
import { ApiError } from '../utils/apiError';

export class ComplianceController {
  /**
   * POST /api/v1/compliance
   * Create a new statutory compliance requirement
   */
  static async createCompliance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const compliance = await complianceService.createCompliance(req.body, userId);

      res.status(201).json({
        success: true,
        message: 'Statutory compliance item registered successfully',
        data: compliance,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/compliance
   * Get all compliances with filtering, search, sorting, and pagination
   */
  static async getCompliances(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      const result = await complianceService.getCompliances(req.query as any, userRole, userId);

      res.status(200).json({
        success: true,
        message: 'Compliances retrieved successfully',
        data: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/projects/:id/compliance
   * Get compliances for a specific industrial unit, along with compliance score
   */
  static async getProjectCompliances(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = req.params.id as string;
      const result = await complianceService.getProjectCompliances(projectId, req.query as any);

      res.status(200).json({
        success: true,
        message: 'Project compliances retrieved successfully',
        data: result.items,
        complianceScore: result.score,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/projects/:id/compliance/score
   * Calculate and display statutory compliance score as percentage
   */
  static async getProjectComplianceScore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = req.params.id as string;
      const score = await complianceService.calculateComplianceScore(projectId);

      res.status(200).json({
        success: true,
        message: 'Compliance score calculated successfully',
        data: score,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/projects/:id/compliance/reminders
   * Get generated reminders (30, 15, 7, 1 days & overdue) for a project
   */
  static async getProjectReminders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = req.params.id as string;
      const reminders = await reminderService.generateProjectReminders(projectId);

      res.status(200).json({
        success: true,
        message: 'Project reminders generated successfully',
        data: reminders,
        totalReminders: reminders.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/compliance/reminders
   * Get all active reminders statewide / across authorized projects
   */
  static async getAllReminders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reminders = await reminderService.generateAllActiveReminders();

      res.status(200).json({
        success: true,
        message: 'Active reminders generated successfully',
        data: reminders,
        totalReminders: reminders.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/compliance/:id
   * Get single compliance item by ID
   */
  static async getComplianceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const compliance = await complianceService.getComplianceById(id);
      const eligibility = complianceEngineService.getRenewalEligibility(compliance);

      res.status(200).json({
        success: true,
        message: 'Compliance retrieved successfully',
        data: compliance,
        renewalEligibility: eligibility,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/compliance/:id
   * Update compliance configuration parameters
   */
  static async updateCompliance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const updated = await complianceService.updateCompliance(id, req.body, userId);

      res.status(200).json({
        success: true,
        message: 'Compliance updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/compliance/:id/status
   * Transition compliance status (Completed, Renewal Pending, Overdue, etc.)
   */
  static async updateComplianceStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const { status, remarks, completionDate, nextDueDate } = req.body;

      const updated = await complianceService.updateComplianceStatus(
        id,
        status,
        remarks,
        userId,
        completionDate,
        nextDueDate
      );

      res.status(200).json({
        success: true,
        message: `Compliance status updated to ${status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/compliance/:id
   * Soft delete compliance record
   */
  static async deleteCompliance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      await complianceService.deleteCompliance(id, userId);

      res.status(200).json({
        success: true,
        message: 'Compliance record archived successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/compliance/engine/evaluate
   * Trigger automated compliance engine evaluation and state transitions
   */
  static async triggerEngineEvaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = req.body.projectId as string | undefined;
      const evaluation = projectId
        ? await complianceEngineService.evaluateProjectCompliances(projectId)
        : await complianceEngineService.evaluateAllCompliances();

      res.status(200).json({
        success: true,
        message: 'Compliance Engine evaluation completed',
        data: evaluation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/compliance/engine/upcoming-renewals
   */
  static async getUpcomingRenewals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = req.query.projectId as string | undefined;
      const renewals = await complianceEngineService.getUpcomingRenewals(projectId);

      res.status(200).json({
        success: true,
        message: 'Upcoming renewals retrieved successfully',
        data: renewals,
        count: renewals.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/compliance/engine/due-30-days
   */
  static async getDueIn30Days(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = req.query.projectId as string | undefined;
      const items = await complianceEngineService.getDueInNext30Days(projectId);

      res.status(200).json({
        success: true,
        message: 'Compliances due in next 30 days retrieved successfully',
        data: items,
        count: items.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/compliance/engine/expired
   */
  static async getExpiredCompliances(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = req.query.projectId as string | undefined;
      const items = await complianceEngineService.getExpiredCompliances(projectId);

      res.status(200).json({
        success: true,
        message: 'Expired / overdue compliances retrieved successfully',
        data: items,
        count: items.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ComplianceController;
