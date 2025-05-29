import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as reviewController from '../controllers/review.controller';

const router = Router();

// Public routes
router.get('/product/:productId', [
  param('productId').isString().notEmpty(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['recent', 'rating-high', 'rating-low', 'helpful']),
  validate
], reviewController.getProductReviews);

router.get('/:id', [
  param('id').isString().notEmpty(),
  validate
], reviewController.getReviewById);

// Protected routes
router.use(authenticate);

// Create review
router.post('/', [
  body('productId').isString().notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').isString().trim().notEmpty().withMessage('Comment is required'),
  validate
], reviewController.createReview);

// Get user's reviews
router.get('/user/my-reviews', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate
], reviewController.getUserReviews);

// Update review
router.put('/:id', [
  param('id').isString().notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').isString().trim().notEmpty().withMessage('Comment is required'),
  validate
], reviewController.updateReview);

// Delete review
router.delete('/:id', [
  param('id').isString().notEmpty(),
  validate
], reviewController.deleteReview);

// Mark review as helpful
router.post('/:id/helpful', [
  param('id').isString().notEmpty(),
  validate
], reviewController.markReviewHelpful);

export default router;
