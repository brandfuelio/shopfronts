import { Router } from 'express';
import { CacheController } from '../controllers/cache.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();

// All cache routes require admin authentication
router.use(authenticate);

// Get cache statistics
router.get('/stats', CacheController.getStats);

// Clear cache
router.post(
  '/clear',
  [
    body('tag').optional().isString(),
    body('pattern').optional().isString(),
    body('all').optional().isBoolean(),
  ],
  validateRequest,
  CacheController.clearCache
);

// Warm cache
router.post('/warm', CacheController.warmCache);

// Get specific cache entry
router.get(
  '/entries/:key',
  [param('key').isString()],
  validateRequest,
  CacheController.getCacheEntry
);

// Delete specific cache entry
router.delete(
  '/entries/:key',
  [param('key').isString()],
  validateRequest,
  CacheController.deleteCacheEntry
);

export default router;