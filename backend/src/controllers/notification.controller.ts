import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { NotificationType } from '@prisma/client';

export class NotificationController {
  /**
   * Get user notifications
   */
  static getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { page = 1, limit = 20, unreadOnly, type } = req.query;

    const result = await NotificationService.getUserNotifications(userId, {
      page: Number(page),
      limit: Number(limit),
      unreadOnly: unreadOnly === 'true',
      type: type as NotificationType,
    });

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Get unread notification count
   */
  static getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const count = await NotificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  });

  /**
   * Mark notification as read
   */
  static markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { notificationId } = req.params;

    const notification = await NotificationService.markAsRead(notificationId, userId);

    res.json({
      success: true,
      data: notification,
    });
  });

  /**
   * Mark all notifications as read
   */
  static markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    await NotificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  });

  /**
   * Delete notification
   */
  static deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { notificationId } = req.params;

    await NotificationService.deleteNotification(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  });

  /**
   * Get notification preferences
   */
  static getPreferences = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const preferences = await NotificationService.getUserPreferences(userId);

    res.json({
      success: true,
      data: preferences,
    });
  });

  /**
   * Update notification preferences
   */
  static updatePreferences = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { email, push, inApp } = req.body;

    await NotificationService.updateUserPreferences(userId, {
      email,
      push,
      inApp,
    });

    res.json({
      success: true,
      message: 'Preferences updated',
    });
  });

  /**
   * Send test notification (admin only)
   */
  static sendTestNotification = asyncHandler(async (req: Request, res: Response) => {
    if (req.user!.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const { userId, type, title, message } = req.body;

    const notification = await NotificationService.createNotification({
      userId,
      type: type || NotificationType.SYSTEM,
      title: title || 'Test Notification',
      message: message || 'This is a test notification',
      sendEmail: true,
      sendPush: true,
    });

    res.json({
      success: true,
      data: notification,
    });
  });

  /**
   * Send system notification (admin only)
   */
  static sendSystemNotification = asyncHandler(async (req: Request, res: Response) => {
    if (req.user!.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const { title, message, targetUsers } = req.body;

    await NotificationService.createSystemNotification({
      title,
      message,
      type: NotificationType.SYSTEM,
      targetUsers,
    });

    res.json({
      success: true,
      message: 'System notification sent',
    });
  });
}