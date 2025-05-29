"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
class NotificationController {
    /**
     * Get user notifications
     */
    static getNotifications = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const { page = 1, limit = 20, unreadOnly, type } = req.query;
        const result = await notification_service_1.NotificationService.getUserNotifications(userId, {
            page: Number(page),
            limit: Number(limit),
            unreadOnly: unreadOnly === 'true',
            type: type,
        });
        res.json({
            success: true,
            data: result,
        });
    });
    /**
     * Get unread notification count
     */
    static getUnreadCount = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const count = await notification_service_1.NotificationService.getUnreadCount(userId);
        res.json({
            success: true,
            data: { count },
        });
    });
    /**
     * Mark notification as read
     */
    static markAsRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const { notificationId } = req.params;
        const notification = await notification_service_1.NotificationService.markAsRead(notificationId, userId);
        res.json({
            success: true,
            data: notification,
        });
    });
    /**
     * Mark all notifications as read
     */
    static markAllAsRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        await notification_service_1.NotificationService.markAllAsRead(userId);
        res.json({
            success: true,
            message: 'All notifications marked as read',
        });
    });
    /**
     * Delete notification
     */
    static deleteNotification = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const { notificationId } = req.params;
        await notification_service_1.NotificationService.deleteNotification(notificationId, userId);
        res.json({
            success: true,
            message: 'Notification deleted',
        });
    });
    /**
     * Get notification preferences
     */
    static getPreferences = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const preferences = await notification_service_1.NotificationService.getUserPreferences(userId);
        res.json({
            success: true,
            data: preferences,
        });
    });
    /**
     * Update notification preferences
     */
    static updatePreferences = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const { email, push, inApp } = req.body;
        await notification_service_1.NotificationService.updateUserPreferences(userId, {
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
    static sendTestNotification = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const { userId, type, title, message } = req.body;
        const notification = await notification_service_1.NotificationService.createNotification({
            userId,
            type: type || client_1.NotificationType.SYSTEM,
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
    static sendSystemNotification = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const { title, message, targetUsers } = req.body;
        await notification_service_1.NotificationService.createSystemNotification({
            title,
            message,
            type: client_1.NotificationType.SYSTEM,
            targetUsers,
        });
        res.json({
            success: true,
            message: 'System notification sent',
        });
    });
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map