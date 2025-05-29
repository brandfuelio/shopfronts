import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Public tracking endpoints (no auth required)
router.post(
  '/track/event',
  [
    body('event').isString().notEmpty(),
    body('category').isString().notEmpty(),
    body('properties').optional().isObject(),
  ],
  validateRequest,
  AnalyticsController.trackEvent
);

router.post(
  '/track/product/:productId',
  [
    param('productId').isString(),
    body('referrer').optional().isString(),
    body('duration').optional().isNumeric(),
  ],
  validateRequest,
  AnalyticsController.trackProductView
);

router.post(
  '/track/search',
  [
    body('query').isString().notEmpty(),
    body('resultsCount').isInt({ min: 0 }),
    body('clickedResults').optional().isArray(),
  ],
  validateRequest,
  AnalyticsController.trackSearch
);

// Protected analytics endpoints
router.use(authenticate);

// Dashboard analytics (sellers and admins)
router.get('/dashboard', AnalyticsController.getDashboardAnalytics);

// Product analytics (sellers and admins)
router.get(
  '/products/:productId',
  [param('productId').isString()],
  validateRequest,
  AnalyticsController.getProductAnalytics
);

// Search analytics (admin only)
router.get('/search', AnalyticsController.getSearchAnalytics);

// User analytics
router.get(
  '/users/:userId',
  [param('userId').isString()],
  validateRequest,
  AnalyticsController.getUserAnalytics
);

// Export analytics (admin only)
router.get(
  '/export',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('type').optional().isIn(['csv', 'json', 'excel']),
  ],
  validateRequest,
  AnalyticsController.exportAnalytics
);

export default router;