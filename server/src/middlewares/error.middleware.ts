import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError';
import { Logger } from '../utils/logger';

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors: any = undefined;

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors.map((e) => ({
      field: e.path.slice(1).join('.') || e.path.join('.'),
      message: e.message,
    }));
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  }

  // Handle Mongoose Duplicate Key Error (e.g. unique email)
  else if (err.code === 11000) {
    statusCode = 409;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with this ${duplicatedField} already exists.`;
  }

  // Handle Mongoose Schema ValidationError
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error occurred';
    errors = Object.values(err.errors || {}).map((val: any) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // Handle JWT specific token errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token signature';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  }

  if (statusCode >= 500) {
    Logger.error(`[Server Error ${statusCode}] ${message}`, {
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Endpoint not found: ${req.method} ${req.originalUrl}`));
};
