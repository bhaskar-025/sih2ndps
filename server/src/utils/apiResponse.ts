import { Response } from 'express';

export class ApiResponse {
  /**
   * Universal Success Response:
   * Accepts both:
   * 1. ApiResponse.success(res, "Message", data, 200)
   * 2. ApiResponse.success(res, data, "Message", 200)
   */
  static success<T>(
    res: Response,
    param2?: string | T,
    param3?: T | string,
    statusCode = 200
  ): Response {
    let message = 'Success';
    let data: any = undefined;

    if (typeof param2 === 'string') {
      message = param2;
      data = param3;
    } else {
      data = param2;
      if (typeof param3 === 'string') {
        message = param3;
      }
    }

    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Universal Resource Created Response (201):
   * Accepts both:
   * 1. ApiResponse.created(res, "Message", data)
   * 2. ApiResponse.created(res, data, "Message")
   */
  static created<T>(
    res: Response,
    param2?: string | T,
    param3?: T | string
  ): Response {
    let message = 'Resource created successfully';
    let data: any = undefined;

    if (typeof param2 === 'string') {
      message = param2;
      data = param3;
    } else {
      data = param2;
      if (typeof param3 === 'string') {
        message = param3;
      }
    }

    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Universal Error Response:
   */
  static error(res: Response, message = 'An error occurred', statusCode = 500, errors?: any): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors ? { errors } : {}),
    });
  }
}

export default ApiResponse;
