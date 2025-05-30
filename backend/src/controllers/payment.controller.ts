import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// Create payment intent
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { orderId, amount, currency, metadata } = req.body;
    const userId = req.user!.id;

    if (!PaymentService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Payment service not available',
        message: 'Payment processing is currently disabled' 
      });
    }

    const result = await PaymentService.createPaymentIntent({
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
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    return res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

// Create checkout session
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { orderId, items, successUrl, cancelUrl } = req.body;
    const userId = req.user!.id;

    if (!PaymentService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Payment service not available',
        message: 'Payment processing is currently disabled' 
      });
    }

    const result = await PaymentService.createCheckoutSession({
      orderId,
      userId,
      items,
      successUrl: successUrl || `${env.FRONTEND_URL}/orders/${orderId}/success`,
      cancelUrl: cancelUrl || `${env.FRONTEND_URL}/orders/${orderId}/cancel`,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

// Handle Stripe webhook
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const payload = req.body; // Raw body

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe signature' });
    }

    await PaymentService.handleWebhook(signature, payload);

    res.json({ received: true });
  } catch (error: any) {
    logger.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Refund payment
export const refundPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    if (!PaymentService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Payment service not available',
        message: 'Payment processing is currently disabled' 
      });
    }

    const refund = await PaymentService.refundPayment(orderId, amount, reason);

    res.json({
      success: true,
      data: refund,
    });
  } catch (error) {
    logger.error('Error creating refund:', error);
    return res.status(500).json({ error: 'Failed to create refund' });
  }
};

// Get payment details
export const getPaymentDetails = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;

    if (!PaymentService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Payment service not available',
        message: 'Payment processing is currently disabled' 
      });
    }

    const paymentIntent = await PaymentService.getPaymentDetails(paymentIntentId);

    res.json({
      success: true,
      data: paymentIntent,
    });
  } catch (error) {
    logger.error('Error retrieving payment details:', error);
    return res.status(500).json({ error: 'Failed to retrieve payment details' });
  }
};

// Get payment configuration (for frontend)
export const getPaymentConfig = async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      enabled: PaymentService.isConfigured(),
      publishableKey: env.STRIPE_PUBLISHABLE_KEY || null,
      supportedMethods: ['card'],
      supportedCurrencies: ['usd', 'eur', 'gbp'],
    },
  });
};