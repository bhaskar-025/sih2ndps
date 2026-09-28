import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';

export class AuthController {
  /**
   * POST /api/v1/auth/register
   * Registers a new user and returns JWT token + user profile
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      ApiResponse.created(res, 'User registered successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   * Authenticates user and issues 7-day JWT access token
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      ApiResponse.success(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Retrieves profile of currently authenticated user
   */
  static async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const user = await AuthService.getCurrentUser(userId);
      ApiResponse.success(res, 'Current user profile retrieved', user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Logs out the user session
   */
  static async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      ApiResponse.success(res, 'Logged out successfully', { loggedOut: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh-token (Structure only)
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.refreshToken(req.body?.refreshToken);
      ApiResponse.success(res, 'Refresh token structure operational', result);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
