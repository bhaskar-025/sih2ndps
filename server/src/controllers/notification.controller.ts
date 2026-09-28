import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export class NotificationController {
  static async getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
      ApiResponse.success(res, notifications, 'Notifications fetched');
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
      if (!updated) throw ApiError.notFound('Notification not found');
      ApiResponse.success(res, updated, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async createNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = new Notification(req.body);
      await notification.save();
      ApiResponse.created(res, notification, 'Notification created');
    } catch (error) {
      next(error);
    }
  }
}
