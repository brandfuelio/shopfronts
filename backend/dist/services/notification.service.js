"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
const websocket_service_1 = require("./websocket.service");
const email_service_1 = require("./email.service");
const prisma = new client_1.PrismaClient();
class NotificationService {
    /**
     * Create and send notification
     */
    static async createNotification(options) {
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
            websocket_service_1.WebSocketService.sendToUser(options.userId, {
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
            logger_1.logger.info('Notification created:', {
                notificationId: notification.id,
                userId: options.userId,
                type: options.type,
            });
            return notification;
        }
        catch (error) {
            logger_1.logger.error('Failed to create notification:', error);
            throw new errors_1.AppError('Failed to create notification', 500);
        }
    }
    /**
     * Get user notification preferences
     */
    static async getUserPreferences(userId) {
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
                ...(user?.notificationPreferences || {}),
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get user preferences:', error);
            return { email: true, push: true, inApp: true };
        }
    }
    /**
     * Update user notification preferences
     */
    static async updateUserPreferences(userId, preferences) {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    notificationPreferences: preferences,
                },
            });
            logger_1.logger.info('Updated notification preferences:', { userId, preferences });
        }
        catch (error) {
            logger_1.logger.error('Failed to update preferences:', error);
            throw new errors_1.AppError('Failed to update preferences', 500);
        }
    }
    /**
     * Send email notification
     */
    static async sendEmailNotification(notification) {
        try {
            await email_service_1.EmailService.sendEmail({
                to: notification.user.email,
                subject: notification.title,
                html: `
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          <p><a href="${process.env.FRONTEND_URL}/notifications">View in app</a></p>
        `,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send email notification:', error);
        }
    }
    /**
     * Send push notification (placeholder for future implementation)
     */
    static async sendPushNotification(notification) {
        // TODO: Implement push notifications using FCM or similar service
        logger_1.logger.info('Push notification would be sent:', {
            notificationId: notification.id,
            userId: notification.userId,
        });
    }
    /**
     * Get user notifications
     */
    static async getUserNotifications(userId, options = {}) {
        const { page = 1, limit = 20, unreadOnly = false, type } = options;
        const skip = (page - 1) * limit;
        try {
            const where = { userId };
            if (unreadOnly)
                where.read = false;
            if (type)
                where.type = type;
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
        }
        catch (error) {
            logger_1.logger.error('Failed to get notifications:', error);
            throw new errors_1.AppError('Failed to get notifications', 500);
        }
    }
    /**
     * Mark notification as read
     */
    static async markAsRead(notificationId, userId) {
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
            websocket_service_1.WebSocketService.sendToUser(userId, {
                type: 'notification_read',
                data: { notificationId, unreadCount },
            });
            return notification;
        }
        catch (error) {
            logger_1.logger.error('Failed to mark notification as read:', error);
            throw new errors_1.AppError('Failed to mark notification as read', 500);
        }
    }
    /**
     * Mark all notifications as read
     */
    static async markAllAsRead(userId) {
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
            websocket_service_1.WebSocketService.sendToUser(userId, {
                type: 'all_notifications_read',
                data: { unreadCount: 0 },
            });
            logger_1.logger.info('Marked all notifications as read:', { userId });
        }
        catch (error) {
            logger_1.logger.error('Failed to mark all as read:', error);
            throw new errors_1.AppError('Failed to mark all as read', 500);
        }
    }
    /**
     * Get unread notification count
     */
    static async getUnreadCount(userId) {
        try {
            return await prisma.notification.count({
                where: {
                    userId,
                    read: false,
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to get unread count:', error);
            return 0;
        }
    }
    /**
     * Delete notification
     */
    static async deleteNotification(notificationId, userId) {
        try {
            await prisma.notification.delete({
                where: {
                    id: notificationId,
                    userId, // Ensure user owns the notification
                },
            });
            logger_1.logger.info('Notification deleted:', { notificationId, userId });
        }
        catch (error) {
            logger_1.logger.error('Failed to delete notification:', error);
            throw new errors_1.AppError('Failed to delete notification', 500);
        }
    }
    /**
     * Create system-wide notification
     */
    static async createSystemNotification(options) {
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
                    websocket_service_1.WebSocketService.sendToUser(userId, {
                        type: 'system_notification',
                        data: {
                            title: options.title,
                            message: options.message,
                        },
                    });
                });
            }
            logger_1.logger.info('System notification sent:', {
                title: options.title,
                userCount: userIds.length,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to create system notification:', error);
            throw new errors_1.AppError('Failed to create system notification', 500);
        }
    }
    /**
     * Notification templates for common scenarios
     */
    static async notifyNewOrder(order) {
        // Notify seller
        await this.createNotification({
            userId: order.sellerId,
            type: client_1.NotificationType.ORDER,
            title: 'New Order Received!',
            message: `You have a new order #${order.orderNumber} for $${order.total}`,
            data: { orderId: order.orderNumber },
            sendEmail: true,
        });
        // Notify buyer
        await this.createNotification({
            userId: order.buyerId,
            type: client_1.NotificationType.ORDER,
            title: 'Order Confirmed',
            message: `Your order #${order.orderNumber} has been confirmed`,
            data: { orderId: order.orderNumber },
            sendEmail: true,
        });
    }
    static async notifyProductApproved(product) {
        await this.createNotification({
            userId: product.sellerId,
            type: client_1.NotificationType.PRODUCT,
            title: 'Product Approved!',
            message: `Your product "${product.productName}" has been approved and is now live`,
            data: { productId: product.productId },
            sendEmail: true,
        });
    }
    static async notifyNewMessage(message) {
        await this.createNotification({
            userId: message.receiverId,
            type: client_1.NotificationType.MESSAGE,
            title: `New message from ${message.senderName}`,
            message: message.preview,
            data: { senderId: message.senderId },
            sendPush: true,
        });
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map