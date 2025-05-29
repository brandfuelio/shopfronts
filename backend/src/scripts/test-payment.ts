import { PaymentService } from '../services/payment.service';
import { logger } from '../utils/logger';

async function testPaymentService() {
  logger.info('Testing Payment Service...');

  // Check if payment service is configured
  const isConfigured = PaymentService.isConfigured();
  logger.info(`Payment service configured: ${isConfigured}`);

  if (!isConfigured) {
    logger.warn('Payment service is not configured. Please set STRIPE_SECRET_KEY in .env');
    return;
  }

  try {
    // Test creating a payment intent
    const testOrderId = 'test-order-123';
    const testUserId = 'test-user-123';
    const testAmount = 99.99;

    logger.info('Creating test payment intent...');
    const paymentIntent = await PaymentService.createPaymentIntent({
      orderId: testOrderId,
      userId: testUserId,
      amount: testAmount,
      metadata: {
        test: 'true',
      },
    });

    logger.info('Payment intent created successfully:', {
      paymentIntentId: paymentIntent.paymentIntentId,
      hasClientSecret: !!paymentIntent.clientSecret,
    });

    // Test creating a customer
    logger.info('Creating test customer...');
    const customer = await PaymentService.createCustomer(
      testUserId,
      'test@example.com',
      'Test User'
    );

    logger.info('Customer created successfully:', {
      customerId: customer.id,
      email: customer.email,
    });

    logger.info('✅ Payment service tests completed successfully');
  } catch (error) {
    logger.error('❌ Payment service test failed:', error);
  }
}

// Run the test
testPaymentService().catch(console.error);