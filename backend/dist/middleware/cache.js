"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheConfigs = exports.cacheKeyGenerators = exports.clearCache = exports.cache = void 0;
const cache_service_1 = require("../services/cache.service");
const logger_1 = require("../utils/logger");
/**
 * Cache middleware for GET requests
 */
const cache = (options = {}) => {
    return async (req, res, next) => {
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
            const cached = await cache_service_1.CacheService.get(key);
            if (cached) {
                logger_1.logger.debug('Cache hit:', { key });
                res.setHeader('X-Cache', 'HIT');
                res.json(cached);
                return;
            }
            // Cache miss - store original json method
            logger_1.logger.debug('Cache miss:', { key });
            res.setHeader('X-Cache', 'MISS');
            const originalJson = res.json;
            res.json = function (data) {
                // Restore original json method
                res.json = originalJson;
                // Cache successful responses only
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const tags = typeof options.tags === 'function'
                        ? options.tags(req)
                        : options.tags;
                    cache_service_1.CacheService.set(key, data, {
                        ttl: options.ttl,
                        tags,
                    }).catch(error => {
                        logger_1.logger.error('Failed to cache response:', { key, error });
                    });
                }
                return originalJson.call(this, data);
            };
            next();
        }
        catch (error) {
            logger_1.logger.error('Cache middleware error:', { key, error });
            next();
        }
    };
};
exports.cache = cache;
/**
 * Clear cache middleware
 */
const clearCache = (tags) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json;
        res.json = function (data) {
            // Restore original json method
            res.json = originalJson;
            // Clear cache on successful mutations
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const tagsToInvalidate = typeof tags === 'function' ? tags(req) : tags;
                if (tagsToInvalidate && tagsToInvalidate.length > 0) {
                    Promise.all(tagsToInvalidate.map(tag => cache_service_1.CacheService.invalidateTag(tag))).catch(error => {
                        logger_1.logger.error('Failed to invalidate cache tags:', { tags: tagsToInvalidate, error });
                    });
                }
            }
            return originalJson.call(this, data);
        };
        next();
    };
};
exports.clearCache = clearCache;
/**
 * Cache key generators
 */
exports.cacheKeyGenerators = {
    /**
     * Generate cache key with user context
     */
    withUser: (prefix) => (req) => {
        const userId = req.user?.id || 'anonymous';
        return `${prefix}:${userId}:${req.originalUrl || req.url}`;
    },
    /**
     * Generate cache key with query parameters
     */
    withQuery: (prefix) => (req) => {
        const queryString = new URLSearchParams(req.query).toString();
        const path = req.path || req.url.split('?')[0];
        return `${prefix}:${path}:${queryString}`;
    },
    /**
     * Generate cache key with specific parameters
     */
    withParams: (prefix, params) => (req) => {
        const values = params.map(param => req.params[param] || req.query[param] || '').join(':');
        return `${prefix}:${values}`;
    },
};
/**
 * Common cache configurations
 */
exports.cacheConfigs = {
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
        keyGenerator: exports.cacheKeyGenerators.withQuery('products'),
        tags: ['products'],
    },
    /**
     * Product detail cache
     */
    productDetail: {
        ttl: 1800, // 30 minutes
        keyGenerator: exports.cacheKeyGenerators.withParams('product', ['id']),
        tags: (req) => ['products', `product:${req.params.id}`],
    },
    /**
     * User profile cache
     */
    userProfile: {
        ttl: 3600, // 1 hour
        keyGenerator: exports.cacheKeyGenerators.withUser('profile'),
        tags: (req) => [`user:${req.user?.id}`],
        condition: (req) => !!req.user,
    },
    /**
     * Search results cache
     */
    searchResults: {
        ttl: 300, // 5 minutes
        keyGenerator: exports.cacheKeyGenerators.withQuery('search'),
        tags: ['search'],
    },
};
//# sourceMappingURL=cache.js.map