import { Request, Response, NextFunction } from 'express';
import { Approval } from '../models/Approval';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export class ApprovalController {
  static async getAllApprovals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter: any = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.departmentId) filter.departmentId = req.query.departmentId;

      const approvals = await Approval.find(filter)
        .populate('applicationId')
        .populate('departmentId')
        .populate('officerId', 'name email designation')
        .sort({ createdAt: -1 });

      ApiResponse.success(res, approvals, 'Approvals fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getApprovalById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const approval = await Approval.findById(req.params.id)
        .populate('applicationId')
        .populate('departmentId')
        .populate('officerId', 'name email designation');

      if (!approval) throw ApiError.notFound('Approval not found');
      ApiResponse.success(res, approval, 'Approval details fetched');
    } catch (error) {
      next(error);
    }
  }

  static async createApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const officerId = req.user?.userId;
      const approval = new Approval({
        ...req.body,
        officerId,
        approvedAt: req.body.status === 'Approved' ? new Date() : undefined,
      });

      await approval.save();
      ApiResponse.created(res, approval, 'Approval record created');
    } catch (error) {
      next(error);
    }
  }

  static async updateApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await Approval.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) throw ApiError.notFound('Approval not found');
      ApiResponse.success(res, updated, 'Approval updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await Approval.findByIdAndDelete(req.params.id);
      if (!deleted) throw ApiError.notFound('Approval not found');
      ApiResponse.success(res, null, 'Approval deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
