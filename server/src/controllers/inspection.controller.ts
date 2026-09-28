import { Request, Response, NextFunction } from 'express';
import { inspectionService } from '../services/inspection.service';
import { inspectionSchedulerService } from '../services/inspectionScheduler.service';
import { inspectionRepository } from '../repositories/inspection.repository';

export class InspectionController {
  /**
   * POST /api/v1/inspections
   * Schedule a new field inspection
   */
  static async createInspection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const result = await inspectionService.createInspection(req.body, userId);

      res.status(201).json({
        success: true,
        message: 'Inspection scheduled successfully',
        data: result.inspection,
        checklist: result.checklist,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/inspections
   * Get all inspections with filtering, pagination, and sorting
   */
  static async getInspections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      const result = await inspectionService.getInspections(req.query as any, userRole, userId);

      res.status(200).json({
        success: true,
        message: 'Inspections retrieved successfully',
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
   * GET /api/v1/inspections/:id
   * Get single inspection details with checklist items and complete audit history
   */
  static async getInspectionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await inspectionService.getInspectionById(id);

      res.status(200).json({
        success: true,
        message: 'Inspection details retrieved successfully',
        data: result.inspection,
        checklist: result.checklist,
        history: result.history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/inspections/:id
   * Update inspection parameters and checklist
   */
  static async updateInspection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const result = await inspectionService.updateInspection(id, req.body, userId);

      res.status(200).json({
        success: true,
        message: 'Inspection updated successfully',
        data: result.inspection,
        checklist: result.checklist,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/inspections/:id/status
   * Transition inspection status (Scheduled, Rescheduled, Completed, Cancelled)
   */
  static async updateInspectionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const updated = await inspectionService.updateInspectionStatus(id, req.body, userId);

      res.status(200).json({
        success: true,
        message: `Inspection status updated to ${req.body.status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/inspections/:id
   * Soft delete inspection
   */
  static async deleteInspection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      await inspectionService.deleteInspection(id, userId);

      res.status(200).json({
        success: true,
        message: 'Inspection record archived successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/inspections/:id/reschedule
   * Reschedule inspection with new date and required reason
   */
  static async rescheduleInspection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const { inspectionDate, inspectionTime, reason } = req.body;

      const updated = await inspectionSchedulerService.rescheduleInspection(
        id,
        inspectionDate,
        inspectionTime,
        reason,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Inspection rescheduled successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/inspections/:id/cancel
   * Cancel inspection with cancellation reason
   */
  static async cancelInspection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const { reason } = req.body;

      const updated = await inspectionSchedulerService.cancelInspection(id, reason, userId);

      res.status(200).json({
        success: true,
        message: 'Inspection cancelled successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/inspections/:id/assign
   * Assign or reassign inspector
   */
  static async assignInspector(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      const { assignedInspector, remarks } = req.body;

      const updated = await inspectionSchedulerService.assignInspector(
        id,
        assignedInspector,
        remarks,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Inspector assigned successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/inspections/:id/checklist
   * Get checklist items for an inspection
   */
  static async getChecklist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const checklist = await inspectionRepository.getChecklist(id);

      res.status(200).json({
        success: true,
        message: 'Checklist items retrieved successfully',
        data: checklist,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/inspections/:id/checklist/:itemId
   * Update status/remarks of a single checklist item
   */
  static async updateChecklistItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const itemId = req.params.itemId as string;
      const updated = await inspectionRepository.updateChecklistItem(itemId, req.body);

      res.status(200).json({
        success: true,
        message: 'Checklist item updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default InspectionController;
