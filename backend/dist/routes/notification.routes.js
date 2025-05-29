"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Get notifications
router.get('/', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('unreadOnly').optional().isBoolean(),
    (0, express_validator_1.query)('type').optional().isString(),
], validation_1.validateRequest, notification_controller_1.NotificationController.getNotifications);
// Get unread count
router.get('/unread-count', notification_controller_1.NotificationController.getUnreadCount);
// Get notification preferences
router.get('/preferences', notification_controller_1.NotificationController.getPreferences);
// Update notification preferences
router.put('/preferences', [
    (0, express_validator_1.body)('email').optional().isBoolean(),
    (0, express_validator_1.body)('push').optional().isBoolean(),
    (0, express_validator_1.body)('inApp').optional().isBoolean(),
], validation_1.validateRequest, notification_controller_1.NotificationController.updatePreferences);
// Mark notification as read
router.put('/:notificationId/read', [(0, express_validator_1.param)('notificationId').isString()], validation_1.validateRequest, notification_controller_1.NotificationController.markAsRead);
// Mark all as read
router.put('/read-all', notification_controller_1.NotificationController.markAllAsRead);
// Delete notification
router.delete('/:notificationId', [(0, express_validator_1.param)('notificationId').isString()], validation_1.validateRequest, notification_controller_1.NotificationController.deleteNotification);
// Admin routes
router.post('/test', [
    (0, express_validator_1.body)('userId').isString(),
    (0, express_validator_1.body)('type').optional().isString(),
    (0, express_validator_1.body)('title').optional().isString(),
    (0, express_validator_1.body)('message').optional().isString(),
], validation_1.validateRequest, notification_controller_1.NotificationController.sendTestNotification);
router.post('/system', [
    (0, express_validator_1.body)('title').isString().notEmpty(),
    (0, express_validator_1.body)('message').isString().notEmpty(),
    (0, express_validator_1.body)('targetUsers').optional().isArray(),
], validation_1.validateRequest, notification_controller_1.NotificationController.sendSystemNotification);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map