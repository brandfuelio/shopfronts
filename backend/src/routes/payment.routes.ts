import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';
import * as paymentController from '../controllers/payment.controller';

const router = Router();

// Get payment configuration (public)
router.get('/config', paymentController.getPaymentConfig);

// Stripe webhook (no auth, but verified by signature)
router.post(
  '/webhook',
  // Note: This needs raw body, not JSON parsed
  paymentController.handleWebhook
);

// Protected routes
router.use(authenticate);

// Create payment intent
router.post(
  '/intent',
  [
    body('orderId').notEmpty().isUUID(),
    body('amount').isFloat({ min: 0.01 }),
    body('currency').optional().isString().isLength({ min: 3, max: 3 }),
    body('metadata').optional().isObject(),
  ],
  validateRequest,
  paymentController.createPaymentIntent
);

// Create checkout session
router.post(
  '/checkout',
  [
    body('orderId').notEmpty().isUUID(),
    body('items').isArray().notEmpty(),
    body('items.*.productId').isUUID(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('items.*.price').isFloat({ min: 0.01 }),
    body('successUrl').optional().isURL(),
    body('cancelUrl').optional().isURL(),
  ],
  validateRequest,
  paymentController.createCheckoutSession
);

// Get payment details
router.get(
  '/intent/:paymentIntentId',
  [param('paymentIntentId').notEmpty().isString()],
  validateRequest,
  paymentController.getPaymentDetails
);

// Admin routes
router.use(authorize(['ADMIN']));

// Refund payment
router.post(
  '/refund/:orderId',
  [
    param('orderId').isUUID(),
    body('amount').optional().isFloat({ min: 0.01 }),
    body('reason').optional().isIn(['duplicate', 'fraudulent', 'requested_by_customer']),
  ],
  validateRequest,
  paymentController.refundPayment
);

export default router;