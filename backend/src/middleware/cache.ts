import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../services/cache.service';
import { logger } from '../utils/logger';

export interface CacheMiddlewareOptions {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
  tags?: string[] | ((req: Request) => string[]);
}

/**
 * Cache middleware for GET requests
 */
export const cache = (options: CacheMiddlewareOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    // Check condition if provided
    if (options.condition && !options.condition(req)) {
      next();
      return;
    }

    // Generate cache key
    const key = options.keyGenerator 
      ? options.keyGenerator(req)
      : `cache:${req.originalUrl || req.url}`;

    try {
      // Try to get from cache
      const cached = await CacheService.get(key);
      if (cached) {
        logger.debug('Cache hit:', { key });
        res.setHeader('X-Cache', 'HIT');
        res.json(cached);
        return;
      }

      // Cache miss - store original json method
      logger.debug('Cache miss:', { key });
      res.setHeader('X-Cache', 'MISS');

      const originalJson = res.json;
      res.json = function(data: any) {
        // Restore original json method
        res.json = originalJson;

        // Cache successful responses only
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const tags = typeof options.tags === 'function' 
            ? options.tags(req) 
            : options.tags;

          CacheService.set(key, data, { 
            ttl: options.ttl,
            tags,
          }).catch(error => {
            logger.error('Failed to cache response:', { key, error });
          });
        }

        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', { key, error });
      next();
    }
  };
};

/**
 * Clear cache middleware
 */
export const clearCache = (tags?: string[] | ((req: Request) => string[])) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Store original json method
    const originalJson = res.json;
    
    res.json = function(data: any) {
      // Restore original json method
      res.json = originalJson;

      // Clear cache on successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const tagsToInvalidate = typeof tags === 'function' ? tags(req) : tags;
        
        if (tagsToInvalidate && tagsToInvalidate.length > 0) {
          Promise.all(
            tagsToInvalidate.map(tag => CacheService.invalidateTag(tag))
          ).catch(error => {
            logger.error('Failed to invalidate cache tags:', { tags: tagsToInvalidate, error });
          });
        }
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Cache key generators
 */
export const cacheKeyGenerators = {
  /**
   * Generate cache key with user context
   */
  withUser: (prefix: string) => (req: Request) => {
    const userId = req.user?.id || 'anonymous';
    return `${prefix}:${userId}:${req.originalUrl || req.url}`;
  },

  /**
   * Generate cache key with query parameters
   */
  withQuery: (prefix: string) => (req: Request) => {
    const queryString = new URLSearchParams(req.query as any).toString();
    const path = req.path || req.url.split('?')[0];
    return `${prefix}:${path}:${queryString}`;
  },

  /**
   * Generate cache key with specific parameters
   */
  withParams: (prefix: string, params: string[]) => (req: Request) => {
    const values = params.map(param => req.params[param] || req.query[param] || '').join(':');
    return `${prefix}:${values}`;
  },
};

/**
 * Common cache configurations
 */
export const cacheConfigs = {
  /**
   * Short cache (5 minutes)
   */
  short: {
    ttl: 300,
  },

  /**
   * Medium cache (1 hour)
   */
  medium: {
    ttl: 3600,
  },

  /**
   * Long cache (24 hours)
   */
  long: {
    ttl: 86400,
  },

  /**
   * Product list cache
   */
  productList: {
    ttl: 600, // 10 minutes
    keyGenerator: cacheKeyGenerators.withQuery('products'),
    tags: ['products'],
  },

  /**
   * Product detail cache
   */
  productDetail: {
    ttl: 1800, // 30 minutes
    keyGenerator: cacheKeyGenerators.withParams('product', ['id']),
    tags: (req: Request) => ['products', `product:${req.params.id}`],
  },

  /**
   * User profile cache
   */
  userProfile: {
    ttl: 3600, // 1 hour
    keyGenerator: cacheKeyGenerators.withUser('profile'),
    tags: (req: Request) => [`user:${req.user?.id}`],
    condition: (req: Request) => !!req.user,
  },

  /**
   * Search results cache
   */
  searchResults: {
    ttl: 300, // 5 minutes
    keyGenerator: cacheKeyGenerators.withQuery('search'),
    tags: ['search'],
  },
};