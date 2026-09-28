import { Request, Response, NextFunction } from 'express';
import { Scheme } from '../models/Scheme';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export class SchemeController {
  static async getAllSchemes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter: any = { active: true };
      if (req.query.departmentId) filter.departmentId = req.query.departmentId;

      const schemes = await Scheme.find(filter).populate('departmentId').sort({ createdAt: -1 });
      ApiResponse.success(res, schemes, 'Schemes fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getSchemeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scheme = await Scheme.findById(req.params.id).populate('departmentId');
      if (!scheme) throw ApiError.notFound('Scheme not found');
      ApiResponse.success(res, scheme, 'Scheme details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createScheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scheme = new Scheme(req.body);
      await scheme.save();
      ApiResponse.created(res, scheme, 'Scheme created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateScheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) throw ApiError.notFound('Scheme not found');
      ApiResponse.success(res, updated, 'Scheme updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteScheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await Scheme.findByIdAndDelete(req.params.id);
      if (!deleted) throw ApiError.notFound('Scheme not found');
      ApiResponse.success(res, null, 'Scheme deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
