"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentConfig = exports.getPaymentDetails = exports.refundPayment = exports.handleWebhook = exports.createCheckoutSession = exports.createPaymentIntent = void 0;
const payment_service_1 = require("../services/payment.service");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
// Create payment intent
const createPaymentIntent = async (req, res) => {
    try {
        const { orderId, amount, currency, metadata } = req.body;
        const userId = req.user.id;
        if (!payment_service_1.PaymentService.isConfigured()) {
            return res.status(503).json({
                error: 'Payment service not available',
                message: 'Payment processing is currently disabled'
            });
        }
        const result = await payment_service_1.PaymentService.createPaymentIntent({
            orderId,
            amount,
            currency,
            userId,
            metadata,
        });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
};
exports.createPaymentIntent = createPaymentIntent;
// Create checkout session
const createCheckoutSession = async (req, res) => {
    try {
        const { orderId, items, successUrl, cancelUrl } = req.body;
        const userId = req.user.id;
        if (!payment_service_1.PaymentService.isConfigured()) {
            return res.status(503).json({
                error: 'Payment service not available',
                message: 'Payment processing is currently disabled'
            });
        }
        const result = await payment_service_1.PaymentService.createCheckoutSession({
            orderId,
            userId,
            items,
            successUrl: successUrl || `${env_1.env.FRONTEND_URL}/orders/${orderId}/success`,
            cancelUrl: cancelUrl || `${env_1.env.FRONTEND_URL}/orders/${orderId}/cancel`,
        });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
};
exports.createCheckoutSession = createCheckoutSession;
// Handle Stripe webhook
const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        const payload = req.body; // Raw body
        if (!signature) {
            return res.status(400).json({ error: 'Missing stripe signature' });
        }
        await payment_service_1.PaymentService.handleWebhook(signature, payload);
        res.json({ received: true });
    }
    catch (error) {
        logger_1.logger.error('Webhook error:', error);
        res.status(400).json({ error: error.message });
    }
};
exports.handleWebhook = handleWebhook;
// Refund payment
const refundPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { amount, reason } = req.body;
        if (!payment_service_1.PaymentService.isConfigured()) {
            return res.status(503).json({
                error: 'Payment service not available',
                message: 'Payment processing is currently disabled'
            });
        }
        const refund = await payment_service_1.PaymentService.refundPayment(orderId, amount, reason);
        res.json({
            success: true,
            data: refund,
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating refund:', error);
        res.status(500).json({ error: 'Failed to create refund' });
    }
};
exports.refundPayment = refundPayment;
// Get payment details
const getPaymentDetails = async (req, res) => {
    try {
        const { paymentIntentId } = req.params;
        if (!payment_service_1.PaymentService.isConfigured()) {
            return res.status(503).json({
                error: 'Payment service not available',
                message: 'Payment processing is currently disabled'
            });
        }
        const paymentIntent = await payment_service_1.PaymentService.getPaymentDetails(paymentIntentId);
        res.json({
            success: true,
            data: paymentIntent,
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving payment details:', error);
        res.status(500).json({ error: 'Failed to retrieve payment details' });
    }
};
exports.getPaymentDetails = getPaymentDetails;
// Get payment configuration (for frontend)
const getPaymentConfig = async (_req, res) => {
    res.json({
        success: true,
        data: {
            enabled: payment_service_1.PaymentService.isConfigured(),
            publishableKey: env_1.env.STRIPE_PUBLISHABLE_KEY || null,
            supportedMethods: ['card'],
            supportedCurrencies: ['usd', 'eur', 'gbp'],
        },
    });
};
exports.getPaymentConfig = getPaymentConfig;
//# sourceMappingURL=payment.controller.js.map