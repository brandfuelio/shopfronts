"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = exports.authLimiter = exports.strictLimiter = exports.generalLimiter = exports.createRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const redis_1 = require("redis");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
// Create Redis client for rate limiting
let redisClient = null;
if (env_1.env.REDIS_URL) {
    redisClient = (0, redis_1.createClient)({
        url: env_1.env.REDIS_URL,
        password: env_1.env.REDIS_PASSWORD,
    });
    redisClient.on('error', (err) => {
        logger_1.logger.error('Redis Client Error:', err);
    });
    redisClient.connect().catch((err) => {
        logger_1.logger.error('Failed to connect to Redis:', err);
        redisClient = null;
    });
}
// Create rate limiter
const createRateLimiter = (options) => {
    const config = {
        windowMs: options?.windowMs || env_1.rateLimitConfig.windowMs,
        max: options?.max || env_1.rateLimitConfig.max,
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Too many requests from this IP, please try again later.',
        handler: (req, res) => {
            logger_1.logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({
                error: 'Too Many Requests',
                message: 'You have exceeded the rate limit. Please try again later.',
                retryAfter: res.getHeader('Retry-After'),
            });
        },
    };
    // Use Redis store if available
    if (redisClient) {
        return (0, express_rate_limit_1.default)({
            ...config,
            store: new rate_limit_redis_1.default({
                client: redisClient,
                prefix: `${env_1.env.REDIS_KEY_PREFIX}rate-limit:`,
            }),
        });
    }
    // Fallback to memory store
    logger_1.logger.warn('Redis not available, using memory store for rate limiting');
    return (0, express_rate_limit_1.default)(config);
};
exports.createRateLimiter = createRateLimiter;
// Default rate limiters
exports.generalLimiter = (0, exports.createRateLimiter)();
exports.strictLimiter = (0, exports.createRateLimiter)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
});
exports.authLimiter = (0, exports.createRateLimiter)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
});
exports.apiLimiter = (0, exports.createRateLimiter)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
});
//# sourceMappingURL=rateLimiter.js.map