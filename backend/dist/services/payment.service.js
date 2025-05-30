"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
// Initialize Stripe
const stripe = env_1.env.STRIPE_SECRET_KEY ? new stripe_1.default(env_1.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-05-28.basil',
}) : null;
class PaymentService {
    // Create a payment intent for direct payment
    static async createPaymentIntent(params) {
        if (!stripe) {
            throw new Error('Payment service not configured');
        }
        try {
            const { amount, currency = 'usd', orderId, userId, metadata = {} } = params;
            // Create payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency,
                metadata: {
                    orderId,
                    userId,
                    ...metadata,
                },
            });
            // Store payment intent in database
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    paymentIntentId: paymentIntent.id,
                    paymentStatus: 'PENDING',
                },
            });
            logger_1.logger.info(`Payment intent created: ${paymentIntent.id} for order ${orderId}`);
            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            };
        }
        catch (error) {
            logger_1.logger.error('Error creating payment intent:', error);
            throw new Error('Failed to create payment intent');
        }
    }
    // Create a checkout session for Stripe Checkout
    static async createCheckoutSession(params) {
        if (!stripe) {
            throw new Error('Payment service not configured');
        }
        try {
            const { orderId, userId, items, successUrl, cancelUrl } = params;
            // Create line items
            const lineItems = await Promise.all(items.map(async (item) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                });
                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: product.name,
                            description: product.description,
                            images: product.screenshots,
                        },
                        unit_amount: Math.round(item.price * 100),
                    },
                    quantity: item.quantity,
                };
            }));
            // Create checkout session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    orderId,
                    userId,
                },
            });
            // Update order with session ID
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    checkoutSessionId: session.id,
                    paymentStatus: 'PENDING',
                },
            });
            logger_1.logger.info(`Checkout session created: ${session.id} for order ${orderId}`);
            return {
                sessionId: session.id,
                url: session.url,
            };
        }
        catch (error) {
            logger_1.logger.error('Error creating checkout session:', error);
            throw new Error('Failed to create checkout session');
        }
    }
    // Handle webhook events from Stripe
    static async handleWebhook(signature, payload) {
        if (!stripe) {
            throw new Error('Payment service not configured');
        }
        try {
            const event = stripe.webhooks.constructEvent(payload, signature, env_1.env.STRIPE_WEBHOOK_SECRET);
            logger_1.logger.info(`Stripe webhook received: ${event.type}`);
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentIntentSucceeded(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentIntentFailed(event.data.object);
                    break;
                case 'checkout.session.completed':
                    await this.handleCheckoutSessionCompleted(event.data.object);
                    break;
                case 'checkout.session.expired':
                    await this.handleCheckoutSessionExpired(event.data.object);
                    break;
                default:
                    logger_1.logger.debug(`Unhandled webhook event: ${event.type}`);
            }
            return { received: true };
        }
        catch (error) {
            logger_1.logger.error('Webhook error:', error);
            throw error;
        }
    }
    // Handle successful payment intent
    static async handlePaymentIntentSucceeded(paymentIntent) {
        const orderId = paymentIntent.metadata.orderId;
        if (!orderId) {
            logger_1.logger.error('No orderId in payment intent metadata');
            return;
        }
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: 'COMPLETED',
                status: 'PROCESSING',
                paymentMethod: paymentIntent.payment_method_types[0],
                paymentDetails: {
                    paymentIntentId: paymentIntent.id,
                    amount: paymentIntent.amount / 100,
                    currency: paymentIntent.currency,
                },
            },
        });
        logger_1.logger.info(`Payment completed for order ${orderId}`);
    }
    // Handle failed payment intent
    static async handlePaymentIntentFailed(paymentIntent) {
        const orderId = paymentIntent.metadata.orderId;
        if (!orderId) {
            logger_1.logger.error('No orderId in payment intent metadata');
            return;
        }
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: 'FAILED',
                paymentDetails: {
                    paymentIntentId: paymentIntent.id,
                    error: paymentIntent.last_payment_error?.message,
                },
            },
        });
        logger_1.logger.info(`Payment failed for order ${orderId}`);
    }
    // Handle completed checkout session
    static async handleCheckoutSessionCompleted(session) {
        const orderId = session.metadata?.orderId;
        if (!orderId) {
            logger_1.logger.error('No orderId in checkout session metadata');
            return;
        }
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: 'COMPLETED',
                status: 'PROCESSING',
                paymentMethod: 'card',
                paymentDetails: {
                    checkoutSessionId: session.id,
                    paymentIntentId: session.payment_intent,
                    amount: (session.amount_total || 0) / 100,
                    currency: session.currency,
                },
            },
        });
        logger_1.logger.info(`Checkout completed for order ${orderId}`);
    }
    // Handle expired checkout session
    static async handleCheckoutSessionExpired(session) {
        const orderId = session.metadata?.orderId;
        if (!orderId) {
            logger_1.logger.error('No orderId in checkout session metadata');
            return;
        }
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: 'EXPIRED',
            },
        });
        logger_1.logger.info(`Checkout expired for order ${orderId}`);
    }
    // Refund a payment
    static async refundPayment(orderId, amount, reason) {
        if (!stripe) {
            throw new Error('Payment service not configured');
        }
        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
            });
            if (!order) {
                throw new Error('Order not found');
            }
            const paymentIntentId = order.paymentIntentId ||
                order.paymentDetails?.paymentIntentId;
            if (!paymentIntentId) {
                throw new Error('No payment intent found for order');
            }
            // Create refund
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
                reason: reason,
            });
            // Update order
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    refundStatus: refund.status === 'succeeded' ? 'REFUNDED' : 'REFUND_PENDING',
                    refundDetails: {
                        refundId: refund.id,
                        amount: refund.amount / 100,
                        reason: refund.reason,
                        status: refund.status,
                    },
                },
            });
            logger_1.logger.info(`Refund created: ${refund.id} for order ${orderId}`);
            return refund;
        }
        catch (error) {
            logger_1.logger.error('Error creating refund:', error);
            throw new Error('Failed to create refund');
        }
    }
    // Get payment details
    static async getPaymentDetails(paymentIntentId) {
        if (!stripe) {
            throw new Error('Payment service not configured');
        }
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        }
        catch (error) {
            logger_1.logger.error('Error retrieving payment details:', error);
            throw new Error('Failed to retrieve payment details');
        }
    }
    // Create a customer
    static async createCustomer(userId, email, name) {
        if (!stripe) {
            throw new Error('Payment service not configured');
        }
        try {
            const customer = await stripe.customers.create({
                email,
                name,
                metadata: { userId },
            });
            // Store customer ID in user record
            await prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customer.id },
            });
            logger_1.logger.info(`Stripe customer created: ${customer.id} for user ${userId}`);
            return customer;
        }
        catch (error) {
            logger_1.logger.error('Error creating customer:', error);
            throw new Error('Failed to create customer');
        }
    }
    // Check if payment service is configured
    static isConfigured() {
        return !!stripe;
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map