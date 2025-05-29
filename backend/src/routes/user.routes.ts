import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as userController from '../controllers/user.controller';

const router = Router();

// Protected routes (require authentication)
router.use(authenticate);

// Get current user profile
router.get('/profile', userController.getProfile);

// Update current user profile
router.put('/profile', [
  body('name').optional().isString().trim().notEmpty(),
  body('avatar').optional().isURL(),
  validate
], userController.updateProfile);

// Change password
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
], userController.changePassword);

// Get user statistics
router.get('/stats', userController.getUserStats);

// Delete account
router.delete('/account', [
  body('password').notEmpty().withMessage('Password is required'),
  validate
], userController.deleteAccount);

// Admin only routes
router.get('/', authorize('ADMIN'), userController.getAllUsers);
router.get('/:id', authorize('ADMIN'), userController.getUserById);
router.put('/:id/status', authorize('ADMIN'), [
  body('isActive').isBoolean(),
  validate
], userController.updateUserStatus);

export default router;