import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export class UserController {
  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, department } = req.query;
      const filter: any = {};
      if (role) filter.role = role;
      if (department) filter.department = department;

      const users = await User.find(filter).sort({ createdAt: -1 });
      ApiResponse.success(res, users, 'Users fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.params.id);
      if (!user) throw ApiError.notFound('User not found');
      ApiResponse.success(res, user, 'User fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) throw ApiError.notFound('User not found');
      ApiResponse.success(res, updated, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await User.findByIdAndDelete(req.params.id);
      if (!deleted) throw ApiError.notFound('User not found');
      ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
