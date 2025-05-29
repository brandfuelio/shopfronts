import { Request, Response } from 'express';
import { CacheService } from '../services/cache.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';

export class CacheController {
  /**
   * Get cache statistics
   */
  static getStats = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const stats = await CacheService.getStats();

    res.json({
      success: true,
      data: stats,
    });
  });

  /**
   * Clear cache by pattern or tag
   */
  static clearCache = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const { tag, pattern, all } = req.body;

    if (all) {
      await CacheService.clear();
      return res.json({
        success: true,
        message: 'All cache cleared',
      });
    }

    if (tag) {
      await CacheService.invalidateTag(tag);
      return res.json({
        success: true,
        message: `Cache tag "${tag}" invalidated`,
      });
    }

    if (pattern) {
      // In a real implementation, you would implement pattern-based deletion
      return res.json({
        success: false,
        message: 'Pattern-based deletion not yet implemented',
      });
    }

    throw new AppError('No cache clearing criteria provided', 400);
  });

  /**
   * Warm cache
   */
  static warmCache = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    // Run cache warming in background
    CacheService.warmCache().catch(error => {
      console.error('Cache warming failed:', error);
    });

    res.json({
      success: true,
      message: 'Cache warming started',
    });
  });

  /**
   * Get specific cache entry
   */
  static getCacheEntry = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const { key } = req.params;
    const value = await CacheService.get(key);

    if (value === null) {
      throw new AppError('Cache entry not found', 404);
    }

    res.json({
      success: true,
      data: {
        key,
        value,
      },
    });
  });

  /**
   * Delete specific cache entry
   */
  static deleteCacheEntry = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const { key } = req.params;
    const deleted = await CacheService.delete(key);

    if (!deleted) {
      throw new AppError('Failed to delete cache entry', 500);
    }

    res.json({
      success: true,
      message: 'Cache entry deleted',
    });
  });
}