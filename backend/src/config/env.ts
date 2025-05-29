import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables
dotenv.config();

// Define environment schema
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  APP_NAME: z.string().default('ShopFronts'),
  APP_URL: z.string().url().default('http://localhost:5000'),
  API_PREFIX: z.string().default('/api/v1'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.string().transform(Number).default('2'),
  DATABASE_POOL_MAX: z.string().transform(Number).default('10'),
  DATABASE_SSL: z.string().transform((val: string) => val === 'true').default('false'),

  // Authentication
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRE: z.string().default('15m'),
  JWT_REFRESH_EXPIRE: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().transform(Number).default('10'),

  // Redis
  REDIS_URL: z.string().url().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default('0'),
  REDIS_KEY_PREFIX: z.string().default('shopfronts:'),

  // Email
  EMAIL_SERVICE: z.enum(['smtp', 'sendgrid']).default('smtp'),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().transform(Number).optional(),
  EMAIL_SECURE: z.string().transform((val: string) => val === 'true').default('false'),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email(),
  EMAIL_FROM_NAME: z.string().default('ShopFronts'),
  SENDGRID_API_KEY: z.string().optional(),

  // File Storage
  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/gif,application/pdf'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_BUCKET_NAME: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ENDPOINT: z.string().optional(),
  CDN_URL: z.string().optional(),

  // Payment
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_SUCCESS_URL: z.string().url().optional(),
  STRIPE_CANCEL_URL: z.string().url().optional(),
  PAYMENT_CURRENCY: z.string().default('USD'),

  // AI Service
  OPENAI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default('gpt-4'),
  AI_MAX_TOKENS: z.string().transform(Number).default('1000'),
  AI_TEMPERATURE: z.string().transform(Number).default('0.7'),
  AI_SYSTEM_PROMPT: z.string().default('You are a helpful AI assistant for ShopFronts digital marketplace.'),

  // Security
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: z.string().transform((val: string) => val === 'true').default('true'),
  SESSION_SECRET: z.string().min(32).optional(),
  ENCRYPTION_KEY: z.string().length(32).optional(),

  // Frontend URLs
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  ADMIN_URL: z.string().url().default('http://localhost:3000/admin'),
  SELLER_URL: z.string().url().default('http://localhost:3000/seller'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
  ENABLE_MORGAN: z.string().transform((val: string) => val === 'true').default('true'),

  // Feature Flags
  ENABLE_AI_CHAT: z.string().transform((val: string) => val === 'true').default('true'),
  ENABLE_PAYMENT_PROCESSING: z.string().transform((val: string) => val === 'true').default('true'),
  ENABLE_EMAIL_NOTIFICATIONS: z.string().transform((val: string) => val === 'true').default('true'),
  ENABLE_FILE_UPLOADS: z.string().transform((val: string) => val === 'true').default('true'),
  ENABLE_WEBSOCKET: z.string().transform((val: string) => val === 'true').default('true'),

  // WebSocket
  WS_PORT: z.string().transform(Number).default('5001'),
  WS_PATH: z.string().default('/socket.io'),

  // Development
  SEED_DATABASE: z.string().transform((val: string) => val === 'true').default('false'),
  MOCK_EXTERNAL_SERVICES: z.string().transform((val: string) => val === 'true').default('true'),

  // Pagination
  DEFAULT_PAGE_SIZE: z.string().transform(Number).default('20'),
  MAX_PAGE_SIZE: z.string().transform(Number).default('100'),

  // Cache
  CACHE_TTL: z.string().transform(Number).default('3600'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`   ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnv();
export const config = env; // Alias for backward compatibility

// Export helper functions
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

// Export feature flags
export const features = {
  aiChat: env.ENABLE_AI_CHAT,
  payment: env.ENABLE_PAYMENT_PROCESSING,
  email: env.ENABLE_EMAIL_NOTIFICATIONS,
  fileUpload: env.ENABLE_FILE_UPLOADS,
  websocket: env.ENABLE_WEBSOCKET,
};

// Export configuration objects
export const corsOptions = {
  origin: env.CORS_ORIGINS.split(',').map((origin: string) => origin.trim()),
  credentials: env.CORS_CREDENTIALS,
};

export const uploadConfig = {
  maxFileSize: env.MAX_FILE_SIZE,
  allowedTypes: env.ALLOWED_FILE_TYPES.split(',').map((type: string) => type.trim()),
  uploadDir: path.resolve(env.UPLOAD_DIR),
};

export const rateLimitConfig = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
};

// Log configuration on startup (only in development)
if (isDevelopment()) {
  console.log('🔧 Environment Configuration:');
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Port: ${env.PORT}`);
  console.log(`   Database: ${env.DATABASE_URL.split('@')[1] || 'configured'}`);
  console.log(`   Redis: ${env.REDIS_URL ? 'configured' : 'not configured'}`);
  console.log(`   Features: ${Object.entries(features).filter(([_, v]) => v).map(([k]) => k).join(', ')}`);
}