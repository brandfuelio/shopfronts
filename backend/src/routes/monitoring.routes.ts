import { Router } from 'express';
import { MonitoringController } from '../controllers/monitoring.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, query } from 'express-validator';

const router = Router();

// Public health check endpoint
router.get('/health', MonitoringController.healthCheck);

// Prometheus metrics endpoint (could be protected in production)
router.get('/metrics', MonitoringController.getPrometheusMetrics);

// Protected monitoring endpoints (admin only)
router.use(authenticate);

// System metrics
router.get('/system', MonitoringController.getMetrics);

// Performance statistics
router.get(
  '/performance',
  [query('hours').optional().isInt({ min: 1, max: 168 })], // Max 7 days
  validateRequest,
  MonitoringController.getPerformanceStats
);

// Error logs
router.get(
  '/errors',
  [query('limit').optional().isInt({ min: 1, max: 1000 })],
  validateRequest,
  MonitoringController.getErrorLogs
);

// Create test alert
router.post(
  '/alerts/test',
  [
    body('type').optional().isString(),
    body('message').optional().isString(),
    body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  ],
  validateRequest,
  MonitoringController.createTestAlert
);

export default router;