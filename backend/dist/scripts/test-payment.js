"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const payment_service_1 = require("../services/payment.service");
const logger_1 = require("../utils/logger");
async function testPaymentService() {
    logger_1.logger.info('Testing Payment Service...');
    // Check if payment service is configured
    const isConfigured = payment_service_1.PaymentService.isConfigured();
    logger_1.logger.info(`Payment service configured: ${isConfigured}`);
    if (!isConfigured) {
        logger_1.logger.warn('Payment service is not configured. Please set STRIPE_SECRET_KEY in .env');
        return;
    }
    try {
        // Test creating a payment intent
        const testOrderId = 'test-order-123';
        const testUserId = 'test-user-123';
        const testAmount = 99.99;
        logger_1.logger.info('Creating test payment intent...');
        const paymentIntent = await payment_service_1.PaymentService.createPaymentIntent({
            orderId: testOrderId,
            userId: testUserId,
            amount: testAmount,
            metadata: {
                test: 'true',
            },
        });
        logger_1.logger.info('Payment intent created successfully:', {
            paymentIntentId: paymentIntent.paymentIntentId,
            hasClientSecret: !!paymentIntent.clientSecret,
        });
        // Test creating a customer
        logger_1.logger.info('Creating test customer...');
        const customer = await payment_service_1.PaymentService.createCustomer(testUserId, 'test@example.com', 'Test User');
        logger_1.logger.info('Customer created successfully:', {
            customerId: customer.id,
            email: customer.email,
        });
        logger_1.logger.info('✅ Payment service tests completed successfully');
    }
    catch (error) {
        logger_1.logger.error('❌ Payment service test failed:', error);
    }
}
// Run the test
testPaymentService().catch(console.error);
//# sourceMappingURL=test-payment.js.map