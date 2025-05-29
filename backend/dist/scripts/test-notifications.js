"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notification_service_1 = require("../services/notification.service");
const email_service_1 = require("../services/email.service");
const logger_1 = require("../utils/logger");
const client_1 = require("@prisma/client");
async function testNotifications() {
    try {
        logger_1.logger.info('Testing notification system...');
        // Initialize email service
        await email_service_1.EmailService.initialize();
        // Test user ID
        const testUserId = 'test-user-123';
        // Test 1: Create a basic notification
        logger_1.logger.info('\nTest 1: Creating basic notification...');
        const notification1 = await notification_service_1.NotificationService.createNotification({
            userId: testUserId,
            type: client_1.NotificationType.SYSTEM,
            title: 'Welcome to ShopFronts!',
            message: 'Thank you for joining our marketplace.',
            data: { welcomeBonus: 10 },
        });
        logger_1.logger.info('Basic notification created:', notification1);
        // Test 2: Create order notification
        logger_1.logger.info('\nTest 2: Creating order notification...');
        await notification_service_1.NotificationService.notifyNewOrder({
            sellerId: 'seller-123',
            buyerId: 'buyer-123',
            orderNumber: 'ORD-2024-001',
            total: 99.99,
        });
        logger_1.logger.info('Order notifications sent');
        // Test 3: Get user notifications
        logger_1.logger.info('\nTest 3: Getting user notifications...');
        const notifications = await notification_service_1.NotificationService.getUserNotifications(testUserId, {
            page: 1,
            limit: 10,
        });
        logger_1.logger.info('User notifications:', notifications);
        // Test 4: Get unread count
        logger_1.logger.info('\nTest 4: Getting unread count...');
        const unreadCount = await notification_service_1.NotificationService.getUnreadCount(testUserId);
        logger_1.logger.info('Unread count:', unreadCount);
        // Test 5: Mark notification as read
        if (notification1) {
            logger_1.logger.info('\nTest 5: Marking notification as read...');
            await notification_service_1.NotificationService.markAsRead(notification1.id, testUserId);
            logger_1.logger.info('Notification marked as read');
        }
        // Test 6: Update user preferences
        logger_1.logger.info('\nTest 6: Updating user preferences...');
        await notification_service_1.NotificationService.updateUserPreferences(testUserId, {
            email: true,
            push: false,
            inApp: true,
        });
        logger_1.logger.info('Preferences updated');
        // Test 7: Send email notification
        logger_1.logger.info('\nTest 7: Sending email notification...');
        await email_service_1.EmailService.sendWelcomeEmail({
            email: 'test@example.com',
            name: 'Test User',
        });
        logger_1.logger.info('Welcome email sent');
        // Test 8: Product approved notification
        logger_1.logger.info('\nTest 8: Product approved notification...');
        await notification_service_1.NotificationService.notifyProductApproved({
            sellerId: 'seller-123',
            productId: 'prod-123',
            productName: 'Amazing Digital Product',
        });
        logger_1.logger.info('Product approved notification sent');
        // Test 9: New message notification
        logger_1.logger.info('\nTest 9: New message notification...');
        await notification_service_1.NotificationService.notifyNewMessage({
            senderId: 'user-456',
            receiverId: testUserId,
            senderName: 'John Doe',
            preview: 'Hey, I have a question about your product...',
        });
        logger_1.logger.info('Message notification sent');
        logger_1.logger.info('\nAll notification tests completed successfully!');
    }
    catch (error) {
        logger_1.logger.error('Notification test failed:', error);
    }
}
// Run the test
testNotifications();
//# sourceMappingURL=test-notifications.js.map