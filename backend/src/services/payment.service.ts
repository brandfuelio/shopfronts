import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Initialize Stripe
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
}) : null;

interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  orderId: string;
  userId: string;
  metadata?: Record<string, string>;
}

interface CreateCheckoutSessionParams {
  orderId: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  successUrl: string;
  cancelUrl: string;
}

export class PaymentService {
  // Create a payment intent for direct payment
  static async createPaymentIntent(params: CreatePaymentIntentParams) {
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

      logger.info(`Payment intent created: ${paymentIntent.id} for order ${orderId}`);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Create a checkout session for Stripe Checkout
  static async createCheckoutSession(params: CreateCheckoutSessionParams) {
    if (!stripe) {
      throw new Error('Payment service not configured');
    }

    try {
      const { orderId, userId, items, successUrl, cancelUrl } = params;

      // Create line items
      const lineItems = await Promise.all(
        items.map(async (item) => {
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
                images: product.images,
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          };
        })
      );

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

      logger.info(`Checkout session created: ${session.id} for order ${orderId}`);

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      logger.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  // Handle webhook events from Stripe
  static async handleWebhook(signature: string, payload: string) {
    if (!stripe) {
      throw new Error('Payment service not configured');
    }

    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );

      logger.info(`Stripe webhook received: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'checkout.session.expired':
          await this.handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
          break;

        default:
          logger.debug(`Unhandled webhook event: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      logger.error('Webhook error:', error);
      throw error;
    }
  }

  // Handle successful payment intent
  private static async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      logger.error('No orderId in payment intent metadata');
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

    logger.info(`Payment completed for order ${orderId}`);
  }

  // Handle failed payment intent
  private static async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      logger.error('No orderId in payment intent metadata');
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

    logger.info(`Payment failed for order ${orderId}`);
  }

  // Handle completed checkout session
  private static async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      logger.error('No orderId in checkout session metadata');
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
          paymentIntentId: session.payment_intent as string,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency,
        },
      },
    });

    logger.info(`Checkout completed for order ${orderId}`);
  }

  // Handle expired checkout session
  private static async handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      logger.error('No orderId in checkout session metadata');
      return;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'EXPIRED',
      },
    });

    logger.info(`Checkout expired for order ${orderId}`);
  }

  // Refund a payment
  static async refundPayment(orderId: string, amount?: number, reason?: string) {
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
        (order.paymentDetails as any)?.paymentIntentId;

      if (!paymentIntentId) {
        throw new Error('No payment intent found for order');
      }

      // Create refund
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
        reason: reason as Stripe.RefundCreateParams.Reason,
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

      logger.info(`Refund created: ${refund.id} for order ${orderId}`);

      return refund;
    } catch (error) {
      logger.error('Error creating refund:', error);
      throw new Error('Failed to create refund');
    }
  }

  // Get payment details
  static async getPaymentDetails(paymentIntentId: string) {
    if (!stripe) {
      throw new Error('Payment service not configured');
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error('Error retrieving payment details:', error);
      throw new Error('Failed to retrieve payment details');
    }
  }

  // Create a customer
  static async createCustomer(userId: string, email: string, name?: string) {
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

      logger.info(`Stripe customer created: ${customer.id} for user ${userId}`);

      return customer;
    } catch (error) {
      logger.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  // Check if payment service is configured
  static isConfigured(): boolean {
    return !!stripe;
  }
}