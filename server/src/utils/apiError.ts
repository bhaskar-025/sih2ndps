export class ApiError extends Error {
  public statusCode: number;
  public errors: any[];
  public isOperational: boolean;

  constructor(statusCode: number, message: string, errors: any[] = [], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', errors: any[] = []): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized access: Invalid or missing token'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden: You do not have permission to access this resource'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message = 'Resource already exists'): ApiError {
    return new ApiError(409, message);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message);
  }
}

export default ApiError;
