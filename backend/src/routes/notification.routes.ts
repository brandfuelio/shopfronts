import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, query, param } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get notifications
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('unreadOnly').optional().isBoolean(),
    query('type').optional().isString(),
  ],
  validateRequest,
  NotificationController.getNotifications
);

// Get unread count
router.get('/unread-count', NotificationController.getUnreadCount);

// Get notification preferences
router.get('/preferences', NotificationController.getPreferences);

// Update notification preferences
router.put(
  '/preferences',
  [
    body('email').optional().isBoolean(),
    body('push').optional().isBoolean(),
    body('inApp').optional().isBoolean(),
  ],
  validateRequest,
  NotificationController.updatePreferences
);

// Mark notification as read
router.put(
  '/:notificationId/read',
  [param('notificationId').isString()],
  validateRequest,
  NotificationController.markAsRead
);

// Mark all as read
router.put('/read-all', NotificationController.markAllAsRead);

// Delete notification
router.delete(
  '/:notificationId',
  [param('notificationId').isString()],
  validateRequest,
  NotificationController.deleteNotification
);

// Admin routes
router.post(
  '/test',
  [
    body('userId').isString(),
    body('type').optional().isString(),
    body('title').optional().isString(),
    body('message').optional().isString(),
  ],
  validateRequest,
  NotificationController.sendTestNotification
);

router.post(
  '/system',
  [
    body('title').isString().notEmpty(),
    body('message').isString().notEmpty(),
    body('targetUsers').optional().isArray(),
  ],
  validateRequest,
  NotificationController.sendSystemNotification
);

export default router;