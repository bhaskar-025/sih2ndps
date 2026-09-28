import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';
import { ApiResponse } from '../utils/apiResponse';

export class AuditController {
  /**
   * GET /audit or /api/v1/audit
   * Retrieve filtered and paginated audit logs
   */
  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        entity,
        action,
        user,
        userId,
        entityId,
        search,
        startDate,
        endDate,
        page,
        limit,
        sort,
      } = req.query;

      const result = await auditService.getAuditLogs({
        entity: entity as string,
        action: action as string,
        user: (user as string) || (userId as string),
        entityId: entityId as string,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50,
        sort: sort as string,
      });

      ApiResponse.success(
        res,
        {
          items: result.items,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
        'Audit logs retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /workflow/:applicationId or /api/v1/workflow/:applicationId
   * Retrieve complete workflow history and state transitions for an application
   */
  static async getWorkflowHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const applicationId = Array.isArray(req.params.applicationId)
        ? req.params.applicationId[0]
        : req.params.applicationId;

      const workflow = await auditService.getApplicationWorkflow(applicationId);
      ApiResponse.success(
        res,
        workflow,
        `Workflow state transitions for application "${applicationId}" retrieved successfully`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /audit/stats or /api/v1/audit/stats
   * Retrieve summary statistics of audit logs
   */
  static async getAuditStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await auditService.getAuditStats();
      ApiResponse.success(res, stats, 'Audit statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /audit or /api/v1/audit
   * Programmatic audit entry creation
   */
  static async createAuditLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = (req as any).user;
      const clientIp =
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      await auditService.logAction({
        user: currentUser?.userId || currentUser?._id || req.body.user,
        action: req.body.action,
        entity: req.body.entity,
        entityId: req.body.entityId,
        oldValue: req.body.oldValue,
        newValue: req.body.newValue,
        ipAddress: req.body.ipAddress || clientIp,
        metadata: req.body.metadata,
      });

      ApiResponse.created(res, null, 'Audit log recorded successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default AuditController;
