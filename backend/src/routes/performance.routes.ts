import { Router } from 'express';
import { PerformanceController } from '../controllers/performance.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, query } from 'express-validator';

const router = Router();

// All performance routes require admin authentication
router.use(authenticate);

// Get performance analysis
router.get('/analysis', PerformanceController.getAnalysis);

// Get performance report
router.get('/report', PerformanceController.getReport);

// Run auto-optimization
router.post('/optimize', PerformanceController.runOptimization);

// Benchmark endpoint
router.post(
  '/benchmark',
  [
    body('endpoint').isString().notEmpty(),
    body('method').optional().isIn(['GET', 'POST', 'PUT', 'DELETE']),
  ],
  validateRequest,
  PerformanceController.benchmarkEndpoint
);

// Get slow queries
router.get(
  '/slow-queries',
  [query('threshold').optional().isInt({ min: 0 })],
  validateRequest,
  PerformanceController.getSlowQueries
);

// Detect memory leaks
router.get('/memory-leaks', PerformanceController.detectMemoryLeaks);

export default router;