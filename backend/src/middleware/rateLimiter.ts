import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { env, rateLimitConfig } from '../config/env';
import { logger } from '../utils/logger';

// Create Redis client for rate limiting
let redisClient: ReturnType<typeof createClient> | null = null;

if (env.REDIS_URL) {
  redisClient = createClient({
    url: env.REDIS_URL,
    password: env.REDIS_PASSWORD,
  });

  redisClient.on('error', (err) => {
    logger.error('Redis Client Error:', err);
  });

  redisClient.connect().catch((err) => {
    logger.error('Failed to connect to Redis:', err);
    redisClient = null;
  });
}

// Create rate limiter
export const createRateLimiter = (options?: Partial<typeof rateLimitConfig>) => {
  const config = {
    windowMs: options?.windowMs || rateLimitConfig.windowMs,
    max: options?.max || rateLimitConfig.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
    handler: (req: any, res: any) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: res.getHeader('Retry-After'),
      });
    },
  };

  // Use Redis store if available
  if (redisClient) {
    return rateLimit({
      ...config,
      store: new RedisStore({
        client: redisClient as any,
        prefix: `${env.REDIS_KEY_PREFIX}rate-limit:`,
      }),
    });
  }

  // Fallback to memory store
  logger.warn('Redis not available, using memory store for rate limiting');
  return rateLimit(config);
};

// Default rate limiters
export const generalLimiter = createRateLimiter();

export const strictLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
});

export const apiLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
});