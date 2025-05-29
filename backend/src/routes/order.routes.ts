import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as orderController from '../controllers/order.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', [
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.street').notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('notes').optional().isString(),
  validate
], orderController.createOrder);

router.get('/my-orders', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  validate
], orderController.getUserOrders);

router.get('/:id', orderController.getOrderById);

router.post('/:id/cancel', [
  body('reason').optional().isString(),
  validate
], orderController.cancelOrder);

// Seller routes
router.get('/seller/orders', authorize('SELLER'), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  validate
], orderController.getSellerOrders);

// Admin routes
router.get('/', authorize('ADMIN'), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  query('search').optional().isString(),
  validate
], orderController.getAllOrders);

router.put('/:id/status', authorize('ADMIN', 'SELLER'), [
  body('status').isIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  validate
], orderController.updateOrderStatus);

export default router;
