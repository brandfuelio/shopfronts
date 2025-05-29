import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import * as adminController from '../controllers/admin.controller';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require admin authentication except createAdminUser
router.post('/create-admin', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').isString().trim().notEmpty(),
  validateRequest
], adminController.createAdminUser);

// Apply admin auth to all other routes
router.use(authenticate, authorize(UserRole.ADMIN));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Users management
router.get('/users', [
  query('role').optional().isIn(['CUSTOMER', 'SELLER', 'ADMIN']),
  query('search').optional().isString(),
  query('isActive').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest
], adminController.getUsers);

router.patch('/users/:userId/status', [
  param('userId').isString(),
  body('isActive').isBoolean(),
  validateRequest
], adminController.updateUserStatus);

router.patch('/users/:userId/role', [
  param('userId').isString(),
  body('role').isIn(['CUSTOMER', 'SELLER', 'ADMIN']),
  validateRequest
], adminController.updateUserRole);

// Products management
router.get('/products', [
  query('search').optional().isString(),
  query('category').optional().isString(),
  query('seller').optional().isString(),
  query('isActive').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest
], adminController.getProducts);

router.patch('/products/:productId/status', [
  param('productId').isString(),
  body('isActive').isBoolean(),
  validateRequest
], adminController.updateProductStatus);

// Orders management
router.get('/orders', [
  query('status').optional().isString(),
  query('userId').optional().isString(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest
], adminController.getOrders);

// Analytics
router.get('/analytics', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']),
  validateRequest
], adminController.getPlatformAnalytics);

// Categories management
router.post('/categories', [
  body('name').isString().trim().notEmpty(),
  body('slug').isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('icon').optional().isString(),
  body('parentId').optional().isString(),
  validateRequest
], adminController.createCategory);

router.put('/categories/:categoryId', [
  param('categoryId').isString(),
  body('name').optional().isString().trim().notEmpty(),
  body('slug').optional().isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('icon').optional().isString(),
  body('parentId').optional().isString(),
  validateRequest
], adminController.updateCategory);

router.delete('/categories/:categoryId', [
  param('categoryId').isString(),
  validateRequest
], adminController.deleteCategory);

// System settings
router.get('/settings', adminController.getSystemSettings);

export default router;
