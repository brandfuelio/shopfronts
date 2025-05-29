"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheController = void 0;
const cache_service_1 = require("../services/cache.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const errors_1 = require("../utils/errors");
class CacheController {
    /**
     * Get cache statistics
     */
    static getStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const stats = await cache_service_1.CacheService.getStats();
        res.json({
            success: true,
            data: stats,
        });
    });
    /**
     * Clear cache by pattern or tag
     */
    static clearCache = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const { tag, pattern, all } = req.body;
        if (all) {
            await cache_service_1.CacheService.clear();
            return res.json({
                success: true,
                message: 'All cache cleared',
            });
        }
        if (tag) {
            await cache_service_1.CacheService.invalidateTag(tag);
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
        throw new errors_1.AppError('No cache clearing criteria provided', 400);
    });
    /**
     * Warm cache
     */
    static warmCache = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        // Run cache warming in background
        cache_service_1.CacheService.warmCache().catch(error => {
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
    static getCacheEntry = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const { key } = req.params;
        const value = await cache_service_1.CacheService.get(key);
        if (value === null) {
            throw new errors_1.AppError('Cache entry not found', 404);
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
    static deleteCacheEntry = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const { key } = req.params;
        const deleted = await cache_service_1.CacheService.delete(key);
        if (!deleted) {
            throw new errors_1.AppError('Failed to delete cache entry', 500);
        }
        res.json({
            success: true,
            message: 'Cache entry deleted',
        });
    });
}
exports.CacheController = CacheController;
//# sourceMappingURL=cache.controller.js.map