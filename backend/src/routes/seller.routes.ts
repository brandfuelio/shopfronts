import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import * as sellerController from '../controllers/seller.controller';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require seller authentication
router.use(authenticate, authorize(UserRole.SELLER));

// Dashboard stats
router.get('/dashboard', sellerController.getDashboardStats);

// Orders
router.get('/orders', [
  query('status').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest
], sellerController.getSellerOrders);

// Products
router.get('/products', [
  query('search').optional().isString(),
  query('category').optional().isString(),
  query('status').optional().isIn(['active', 'inactive']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest
], sellerController.getSellerProducts);

// Profile
router.put('/profile', [
  body('businessName').optional().isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('website').optional().isURL(),
  body('payoutDetails').optional().isObject(),
  validateRequest
], sellerController.updateSellerProfile);

// Analytics
router.get('/analytics', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']),
  validateRequest
], sellerController.getSellerAnalytics);

// Payouts
router.get('/payouts', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest
], sellerController.getPayoutHistory);

export default router;
