import { Request, Response, NextFunction } from 'express';
import { Department } from '../models/Department';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export class DepartmentController {
  static async getAllDepartments(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const departments = await Department.find({ isActive: true }).sort({ name: 1 });
      ApiResponse.success(res, departments, 'Departments fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getDepartmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = await Department.findById(req.params.id);
      if (!department) throw ApiError.notFound('Department not found');
      ApiResponse.success(res, department, 'Department fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dept = new Department(req.body);
      await dept.save();
      ApiResponse.created(res, dept, 'Department created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) throw ApiError.notFound('Department not found');
      ApiResponse.success(res, updated, 'Department updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await Department.findByIdAndDelete(req.params.id);
      if (!deleted) throw ApiError.notFound('Department not found');
      ApiResponse.success(res, null, 'Department deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
