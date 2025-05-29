import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as categoryController from '../controllers/category.controller';

const router = Router();

// Public routes
// Get all categories
router.get('/', categoryController.getCategories);

// Get category by ID
router.get(
  '/:id',
  [param('id').isUUID()],
  validate,
  categoryController.getCategoryById
);

// Protected routes (admin only)
// Create category
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('description').optional().trim(),
    body('image').optional().isURL()
  ],
  validate,
  categoryController.createCategory
);

// Update category
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  [
    param('id').isUUID(),
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('image').optional().isURL()
  ],
  validate,
  categoryController.updateCategory
);

// Delete category
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  [param('id').isUUID()],
  validate,
  categoryController.deleteCategory
);

export default router;
