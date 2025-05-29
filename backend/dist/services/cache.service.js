"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const ioredis_1 = require("ioredis");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
class CacheService {
    static redis = null;
    static defaultTTL = 3600; // 1 hour
    static initialize() {
        if (env_1.config.REDIS_URL) {
            this.redis = new ioredis_1.Redis(env_1.config.REDIS_URL, {
                maxRetriesPerRequest: 3,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
            });
            this.redis.on('error', (error) => {
                logger_1.logger.error('Redis connection error:', error);
            });
            this.redis.on('connect', () => {
                logger_1.logger.info('Redis connected successfully');
            });
        }
        else {
            logger_1.logger.warn('Redis URL not configured, caching disabled');
        }
    }
    /**
     * Get value from cache
     */
    static async get(key) {
        if (!this.redis)
            return null;
        try {
            const value = await this.redis.get(key);
            if (!value)
                return null;
            return JSON.parse(value);
        }
        catch (error) {
            logger_1.logger.error('Cache get error:', { key, error });
            return null;
        }
    }
    /**
     * Set value in cache
     */
    static async set(key, value, options = {}) {
        if (!this.redis)
            return false;
        try {
            const ttl = options.ttl || this.defaultTTL;
            const serialized = JSON.stringify(value);
            if (ttl > 0) {
                await this.redis.setex(key, ttl, serialized);
            }
            else {
                await this.redis.set(key, serialized);
            }
            // Add to tags for invalidation
            if (options.tags && options.tags.length > 0) {
                const pipeline = this.redis.pipeline();
                for (const tag of options.tags) {
                    pipeline.sadd(`tag:${tag}`, key);
                    if (ttl > 0) {
                        pipeline.expire(`tag:${tag}`, ttl);
                    }
                }
                await pipeline.exec();
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error('Cache set error:', { key, error });
            return false;
        }
    }
    /**
     * Delete value from cache
     */
    static async delete(key) {
        if (!this.redis)
            return false;
        try {
            await this.redis.del(key);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Cache delete error:', { key, error });
            return false;
        }
    }
    /**
     * Delete multiple keys
     */
    static async deleteMany(keys) {
        if (!this.redis || keys.length === 0)
            return false;
        try {
            await this.redis.del(...keys);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Cache delete many error:', { keys, error });
            return false;
        }
    }
    /**
     * Invalidate cache by tag
     */
    static async invalidateTag(tag) {
        if (!this.redis)
            return false;
        try {
            const keys = await this.redis.smembers(`tag:${tag}`);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
            await this.redis.del(`tag:${tag}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Cache invalidate tag error:', { tag, error });
            return false;
        }
    }
    /**
     * Clear all cache
     */
    static async clear() {
        if (!this.redis)
            return false;
        try {
            await this.redis.flushdb();
            return true;
        }
        catch (error) {
            logger_1.logger.error('Cache clear error:', error);
            return false;
        }
    }
    /**
     * Get or set cache (cache-aside pattern)
     */
    static async getOrSet(key, factory, options = {}) {
        // Try to get from cache
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        // Get fresh value
        const value = await factory();
        // Store in cache (don't await)
        this.set(key, value, options).catch((error) => {
            logger_1.logger.error('Failed to cache value:', { key, error });
        });
        return value;
    }
    /**
     * Increment counter
     */
    static async increment(key, amount = 1) {
        if (!this.redis)
            return null;
        try {
            return await this.redis.incrby(key, amount);
        }
        catch (error) {
            logger_1.logger.error('Cache increment error:', { key, error });
            return null;
        }
    }
    /**
     * Set hash field
     */
    static async hset(key, field, value) {
        if (!this.redis)
            return false;
        try {
            await this.redis.hset(key, field, JSON.stringify(value));
            return true;
        }
        catch (error) {
            logger_1.logger.error('Cache hset error:', { key, field, error });
            return false;
        }
    }
    /**
     * Get hash field
     */
    static async hget(key, field) {
        if (!this.redis)
            return null;
        try {
            const value = await this.redis.hget(key, field);
            if (!value)
                return null;
            return JSON.parse(value);
        }
        catch (error) {
            logger_1.logger.error('Cache hget error:', { key, field, error });
            return null;
        }
    }
    /**
     * Get all hash fields
     */
    static async hgetall(key) {
        if (!this.redis)
            return null;
        try {
            const hash = await this.redis.hgetall(key);
            const result = {};
            for (const [field, value] of Object.entries(hash)) {
                try {
                    result[field] = JSON.parse(value);
                }
                catch {
                    result[field] = value;
                }
            }
            return result;
        }
        catch (error) {
            logger_1.logger.error('Cache hgetall error:', { key, error });
            return null;
        }
    }
    /**
     * Add to sorted set
     */
    static async zadd(key, score, member) {
        if (!this.redis)
            return false;
        try {
            await this.redis.zadd(key, score, member);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Cache zadd error:', { key, error });
            return false;
        }
    }
    /**
     * Get sorted set range
     */
    static async zrange(key, start, stop, withScores = false) {
        if (!this.redis)
            return [];
        try {
            if (withScores) {
                const result = await this.redis.zrange(key, start, stop, 'WITHSCORES');
                const items = [];
                for (let i = 0; i < result.length; i += 2) {
                    items.push({
                        member: result[i],
                        score: parseFloat(result[i + 1]),
                    });
                }
                return items;
            }
            else {
                return await this.redis.zrange(key, start, stop);
            }
        }
        catch (error) {
            logger_1.logger.error('Cache zrange error:', { key, error });
            return [];
        }
    }
    /**
     * Cache warming - preload frequently accessed data
     */
    static async warmCache() {
        logger_1.logger.info('Starting cache warming...');
        try {
            // This would be customized based on your application's needs
            // Example: preload popular products, categories, etc.
            logger_1.logger.info('Cache warming completed');
        }
        catch (error) {
            logger_1.logger.error('Cache warming error:', error);
        }
    }
    /**
     * Get cache statistics
     */
    static async getStats() {
        if (!this.redis) {
            return { enabled: false };
        }
        try {
            const info = await this.redis.info('stats');
            const dbSize = await this.redis.dbsize();
            // Parse Redis info
            const stats = {
                enabled: true,
                dbSize,
                connected: this.redis.status === 'ready',
            };
            // Extract key metrics from info
            const lines = info.split('\r\n');
            for (const line of lines) {
                if (line.includes(':')) {
                    const [key, value] = line.split(':');
                    if (['total_connections_received', 'total_commands_processed', 'instantaneous_ops_per_sec', 'used_memory_human'].includes(key)) {
                        stats[key] = value;
                    }
                }
            }
            return stats;
        }
        catch (error) {
            logger_1.logger.error('Failed to get cache stats:', error);
            return { enabled: true, error: error.message };
        }
    }
}
exports.CacheService = CacheService;
// Initialize cache service
CacheService.initialize();
//# sourceMappingURL=cache.service.js.map