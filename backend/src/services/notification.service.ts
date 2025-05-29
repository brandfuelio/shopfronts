import { PrismaClient, NotificationType } from '@prisma/client';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { WebSocketService } from './websocket.service';
import { EmailService } from './email.service';

const prisma = new PrismaClient();

interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  sendEmail?: boolean;
  sendPush?: boolean;
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export class NotificationService {
  /**
   * Create and send notification
   */
  static async createNotification(options: CreateNotificationOptions) {
    try {
      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId: options.userId,
          type: options.type,
          title: options.title,
          message: options.message,
          data: options.data || {},
          read: false,
        },
        include: {
          user: true,
        },
      });

      // Send real-time notification via WebSocket
      WebSocketService.sendToUser(options.userId, {
        type: 'notification',
        data: notification,
      });

      // Get user preferences
      const preferences = await this.getUserPreferences(options.userId);

      // Send email notification if enabled
      if (options.sendEmail && preferences.email) {
        await this.sendEmailNotification(notification);
      }

      // Send push notification if enabled
      if (options.sendPush && preferences.push) {
        await this.sendPushNotification(notification);
      }

      logger.info('Notification created:', {
        notificationId: notification.id,
        userId: options.userId,
        type: options.type,
      });

      return notification;
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw new AppError('Failed to create notification', 500);
    }
  }

  /**
   * Get user notification preferences
   */
  static async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          notificationPreferences: true,
        },
      });

      // Default preferences if not set
      const defaultPreferences = {
        email: true,
        push: true,
        inApp: true,
      };

      return {
        ...defaultPreferences,
        ...(user?.notificationPreferences as any || {}),
      };
    } catch (error) {
      logger.error('Failed to get user preferences:', error);
      return { email: true, push: true, inApp: true };
    }
  }

  /**
   * Update user notification preferences
   */
  static async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          notificationPreferences: preferences as any,
        },
      });

      logger.info('Updated notification preferences:', { userId, preferences });
    } catch (error) {
      logger.error('Failed to update preferences:', error);
      throw new AppError('Failed to update preferences', 500);
    }
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(notification: any) {
    try {
      await EmailService.sendEmail({
        to: notification.user.email,
        subject: notification.title,
        html: `
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          <p><a href="${process.env.FRONTEND_URL}/notifications">View in app</a></p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send email notification:', error);
    }
  }

  /**
   * Send push notification (placeholder for future implementation)
   */
  private static async sendPushNotification(notification: any) {
    // TODO: Implement push notifications using FCM or similar service
    logger.info('Push notification would be sent:', {
      notificationId: notification.id,
      userId: notification.userId,
    });
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
      type?: NotificationType;
    } = {}
  ) {
    const { page = 1, limit = 20, unreadOnly = false, type } = options;
    const skip = (page - 1) * limit;

    try {
      const where: any = { userId };
      if (unreadOnly) where.read = false;
      if (type) where.type = type;

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.notification.count({ where }),
      ]);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get notifications:', error);
      throw new AppError('Failed to get notifications', 500);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId, // Ensure user owns the notification
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      // Update unread count via WebSocket
      const unreadCount = await this.getUnreadCount(userId);
      WebSocketService.sendToUser(userId, {
        type: 'notification_read',
        data: { notificationId, unreadCount },
      });

      return notification;
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
      throw new AppError('Failed to mark notification as read', 500);
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string) {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      // Update unread count via WebSocket
      WebSocketService.sendToUser(userId, {
        type: 'all_notifications_read',
        data: { unreadCount: 0 },
      });

      logger.info('Marked all notifications as read:', { userId });
    } catch (error) {
      logger.error('Failed to mark all as read:', error);
      throw new AppError('Failed to mark all as read', 500);
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });
    } catch (error) {
      logger.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    try {
      await prisma.notification.delete({
        where: {
          id: notificationId,
          userId, // Ensure user owns the notification
        },
      });

      logger.info('Notification deleted:', { notificationId, userId });
    } catch (error) {
      logger.error('Failed to delete notification:', error);
      throw new AppError('Failed to delete notification', 500);
    }
  }

  /**
   * Create system-wide notification
   */
  static async createSystemNotification(options: {
    title: string;
    message: string;
    type: NotificationType;
    targetUsers?: string[]; // If not provided, send to all users
  }) {
    try {
      let userIds = options.targetUsers;

      // If no specific users, get all active users
      if (!userIds) {
        const users = await prisma.user.findMany({
          where: { isActive: true },
          select: { id: true },
        });
        userIds = users.map(u => u.id);
      }

      // Create notifications in batches
      const batchSize = 100;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        
        await prisma.notification.createMany({
          data: batch.map(userId => ({
            userId,
            type: options.type,
            title: options.title,
            message: options.message,
            data: { isSystemNotification: true },
            read: false,
          })),
        });

        // Send WebSocket notifications
        batch.forEach(userId => {
          WebSocketService.sendToUser(userId, {
            type: 'system_notification',
            data: {
              title: options.title,
              message: options.message,
            },
          });
        });
      }

      logger.info('System notification sent:', {
        title: options.title,
        userCount: userIds.length,
      });
    } catch (error) {
      logger.error('Failed to create system notification:', error);
      throw new AppError('Failed to create system notification', 500);
    }
  }

  /**
   * Notification templates for common scenarios
   */
  static async notifyNewOrder(order: {
    sellerId: string;
    buyerId: string;
    orderNumber: string;
    total: number;
  }) {
    // Notify seller
    await this.createNotification({
      userId: order.sellerId,
      type: NotificationType.ORDER,
      title: 'New Order Received!',
      message: `You have a new order #${order.orderNumber} for $${order.total}`,
      data: { orderId: order.orderNumber },
      sendEmail: true,
    });

    // Notify buyer
    await this.createNotification({
      userId: order.buyerId,
      type: NotificationType.ORDER,
      title: 'Order Confirmed',
      message: `Your order #${order.orderNumber} has been confirmed`,
      data: { orderId: order.orderNumber },
      sendEmail: true,
    });
  }

  static async notifyProductApproved(product: {
    sellerId: string;
    productId: string;
    productName: string;
  }) {
    await this.createNotification({
      userId: product.sellerId,
      type: NotificationType.PRODUCT,
      title: 'Product Approved!',
      message: `Your product "${product.productName}" has been approved and is now live`,
      data: { productId: product.productId },
      sendEmail: true,
    });
  }

  static async notifyNewMessage(message: {
    senderId: string;
    receiverId: string;
    senderName: string;
    preview: string;
  }) {
    await this.createNotification({
      userId: message.receiverId,
      type: NotificationType.MESSAGE,
      title: `New message from ${message.senderName}`,
      message: message.preview,
      data: { senderId: message.senderId },
      sendPush: true,
    });
  }
}