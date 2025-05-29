import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';
import { logger } from '../utils/logger';
import { NotificationType } from '@prisma/client';

async function testNotifications() {
  try {
    logger.info('Testing notification system...');

    // Initialize email service
    await EmailService.initialize();

    // Test user ID
    const testUserId = 'test-user-123';

    // Test 1: Create a basic notification
    logger.info('\nTest 1: Creating basic notification...');
    const notification1 = await NotificationService.createNotification({
      userId: testUserId,
      type: NotificationType.SYSTEM,
      title: 'Welcome to ShopFronts!',
      message: 'Thank you for joining our marketplace.',
      data: { welcomeBonus: 10 },
    });
    logger.info('Basic notification created:', notification1);

    // Test 2: Create order notification
    logger.info('\nTest 2: Creating order notification...');
    await NotificationService.notifyNewOrder({
      sellerId: 'seller-123',
      buyerId: 'buyer-123',
      orderNumber: 'ORD-2024-001',
      total: 99.99,
    });
    logger.info('Order notifications sent');

    // Test 3: Get user notifications
    logger.info('\nTest 3: Getting user notifications...');
    const notifications = await NotificationService.getUserNotifications(testUserId, {
      page: 1,
      limit: 10,
    });
    logger.info('User notifications:', notifications);

    // Test 4: Get unread count
    logger.info('\nTest 4: Getting unread count...');
    const unreadCount = await NotificationService.getUnreadCount(testUserId);
    logger.info('Unread count:', unreadCount);

    // Test 5: Mark notification as read
    if (notification1) {
      logger.info('\nTest 5: Marking notification as read...');
      await NotificationService.markAsRead(notification1.id, testUserId);
      logger.info('Notification marked as read');
    }

    // Test 6: Update user preferences
    logger.info('\nTest 6: Updating user preferences...');
    await NotificationService.updateUserPreferences(testUserId, {
      email: true,
      push: false,
      inApp: true,
    });
    logger.info('Preferences updated');

    // Test 7: Send email notification
    logger.info('\nTest 7: Sending email notification...');
    await EmailService.sendWelcomeEmail({
      email: 'test@example.com',
      name: 'Test User',
    });
    logger.info('Welcome email sent');

    // Test 8: Product approved notification
    logger.info('\nTest 8: Product approved notification...');
    await NotificationService.notifyProductApproved({
      sellerId: 'seller-123',
      productId: 'prod-123',
      productName: 'Amazing Digital Product',
    });
    logger.info('Product approved notification sent');

    // Test 9: New message notification
    logger.info('\nTest 9: New message notification...');
    await NotificationService.notifyNewMessage({
      senderId: 'user-456',
      receiverId: testUserId,
      senderName: 'John Doe',
      preview: 'Hey, I have a question about your product...',
    });
    logger.info('Message notification sent');

    logger.info('\nAll notification tests completed successfully!');
  } catch (error) {
    logger.error('Notification test failed:', error);
  }
}

// Run the test
testNotifications();