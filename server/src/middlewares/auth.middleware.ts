import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtTokenPayload } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: JwtTokenPayload & {
        _id?: string;
        organization?: string;
        department?: string;
      };
    }
  }
}

/**
 * Authentication Middleware: Validates JWT access token
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token missing or invalid format (Bearer token required)');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw ApiError.unauthorized('Access token is missing');
    }

    const decoded = verifyAccessToken(token);

    // Verify user exists in database and is active
    const user = await User.findById(decoded.userId).select('+role +isActive');
    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('User account is deactivated. Please contact support.');
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role.toLowerCase(),
      name: user.name,
      organization: user.organization,
      department: user.department,
    };

    next();
  } catch (error: any) {
    next(error);
  }
};

/**
 * Authorization Middleware: Checks if user possesses one of the allowed roles
 * Supports case-insensitive comparison (e.g., 'Admin', 'admin', 'Officer', etc.)
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('User not authenticated'));
    }

    const userRole = (req.user.role || '').toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role '${req.user.role}' is not authorized. Required: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};

/**
 * Optional Authentication: Attaches user if valid token present, otherwise proceeds
 */
export const optionalAuthenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = verifyAccessToken(token);
          const user = await User.findById(decoded.userId).select('+role +isActive');
          if (user && user.isActive) {
            req.user = {
              userId: user._id.toString(),
              email: user.email,
              role: user.role.toLowerCase(),
              name: user.name,
              organization: user.organization,
              department: user.department,
            };
          }
        } catch {
          // Token invalid or expired, continue without user
        }
      }
    }
    next();
  } catch {
    next();
  }
};

// Aliases for compatibility
export const authenticateJwt = authenticate;
export const authorizeRoles = authorize;
