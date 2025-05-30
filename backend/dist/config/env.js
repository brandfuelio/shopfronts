"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitConfig = exports.uploadConfig = exports.corsOptions = exports.features = exports.isTest = exports.isProduction = exports.isDevelopment = exports.config = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
// Define environment schema
const envSchema = zod_1.z.object({
    // Application
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.string().transform(Number).default('5000'),
    APP_NAME: zod_1.z.string().default('ShopFronts'),
    APP_URL: zod_1.z.string().url().default('http://localhost:5000'),
    API_PREFIX: zod_1.z.string().default('/api/v1'),
    // Database
    DATABASE_URL: zod_1.z.string().url(),
    DATABASE_POOL_MIN: zod_1.z.string().transform(Number).default('2'),
    DATABASE_POOL_MAX: zod_1.z.string().transform(Number).default('10'),
    DATABASE_SSL: zod_1.z.string().transform((val) => val === 'true').default('false'),
    // Authentication
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRE: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRE: zod_1.z.string().default('7d'),
    BCRYPT_ROUNDS: zod_1.z.string().transform(Number).default('10'),
    // Redis
    REDIS_URL: zod_1.z.string().url().optional(),
    REDIS_PASSWORD: zod_1.z.string().optional(),
    REDIS_DB: zod_1.z.string().transform(Number).default('0'),
    REDIS_KEY_PREFIX: zod_1.z.string().default('shopfronts:'),
    // Email
    EMAIL_SERVICE: zod_1.z.enum(['smtp', 'sendgrid']).default('smtp'),
    EMAIL_HOST: zod_1.z.string().optional(),
    EMAIL_PORT: zod_1.z.string().transform(Number).optional(),
    EMAIL_SECURE: zod_1.z.string().transform((val) => val === 'true').default('false'),
    EMAIL_USER: zod_1.z.string().optional(),
    EMAIL_PASS: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().email(),
    EMAIL_FROM_NAME: zod_1.z.string().default('ShopFronts'),
    SENDGRID_API_KEY: zod_1.z.string().optional(),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().transform(Number).optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    // File Storage
    STORAGE_TYPE: zod_1.z.enum(['local', 's3']).default('local'),
    UPLOAD_DIR: zod_1.z.string().default('./uploads'),
    MAX_FILE_SIZE: zod_1.z.string().transform(Number).default('10485760'),
    ALLOWED_FILE_TYPES: zod_1.z.string().default('image/jpeg,image/png,image/gif,application/pdf'),
    AWS_ACCESS_KEY_ID: zod_1.z.string().optional(),
    AWS_SECRET_ACCESS_KEY: zod_1.z.string().optional(),
    AWS_BUCKET_NAME: zod_1.z.string().optional(),
    AWS_REGION: zod_1.z.string().default('us-east-1'),
    AWS_ENDPOINT: zod_1.z.string().optional(),
    CDN_URL: zod_1.z.string().optional(),
    // Payment
    STRIPE_SECRET_KEY: zod_1.z.string().optional(),
    STRIPE_PUBLISHABLE_KEY: zod_1.z.string().optional(),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string().optional(),
    STRIPE_SUCCESS_URL: zod_1.z.string().url().optional(),
    STRIPE_CANCEL_URL: zod_1.z.string().url().optional(),
    PAYMENT_CURRENCY: zod_1.z.string().default('USD'),
    // AI Service
    OPENAI_API_KEY: zod_1.z.string().optional(),
    AI_MODEL: zod_1.z.string().default('gpt-4'),
    AI_MAX_TOKENS: zod_1.z.string().transform(Number).default('1000'),
    AI_TEMPERATURE: zod_1.z.string().transform(Number).default('0.7'),
    AI_SYSTEM_PROMPT: zod_1.z.string().default('You are a helpful AI assistant for ShopFronts digital marketplace.'),
    // Security
    CORS_ORIGINS: zod_1.z.string().default('http://localhost:3000'),
    CORS_CREDENTIALS: zod_1.z.string().transform((val) => val === 'true').default('true'),
    SESSION_SECRET: zod_1.z.string().min(32).optional(),
    ENCRYPTION_KEY: zod_1.z.string().length(32).optional(),
    // Frontend URLs
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:3000'),
    ADMIN_URL: zod_1.z.string().url().default('http://localhost:3000/admin'),
    SELLER_URL: zod_1.z.string().url().default('http://localhost:3000/seller'),
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().transform(Number).default('900000'),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().transform(Number).default('100'),
    // Monitoring
    SENTRY_DSN: zod_1.z.string().optional(),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
    ENABLE_MORGAN: zod_1.z.string().transform((val) => val === 'true').default('true'),
    // Feature Flags
    ENABLE_AI_CHAT: zod_1.z.string().transform((val) => val === 'true').default('true'),
    ENABLE_PAYMENT_PROCESSING: zod_1.z.string().transform((val) => val === 'true').default('true'),
    ENABLE_EMAIL_NOTIFICATIONS: zod_1.z.string().transform((val) => val === 'true').default('true'),
    ENABLE_FILE_UPLOADS: zod_1.z.string().transform((val) => val === 'true').default('true'),
    ENABLE_WEBSOCKET: zod_1.z.string().transform((val) => val === 'true').default('true'),
    // WebSocket
    WS_PORT: zod_1.z.string().transform(Number).default('5001'),
    WS_PATH: zod_1.z.string().default('/socket.io'),
    // Development
    SEED_DATABASE: zod_1.z.string().transform((val) => val === 'true').default('false'),
    MOCK_EXTERNAL_SERVICES: zod_1.z.string().transform((val) => val === 'true').default('true'),
    // Pagination
    DEFAULT_PAGE_SIZE: zod_1.z.string().transform(Number).default('20'),
    MAX_PAGE_SIZE: zod_1.z.string().transform(Number).default('100'),
    // Cache
    CACHE_TTL: zod_1.z.string().transform(Number).default('3600'),
});
// Parse and validate environment variables
const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
exports.env = parseEnv();
exports.config = exports.env; // Alias for backward compatibility
// Export helper functions
const isDevelopment = () => exports.env.NODE_ENV === 'development';
exports.isDevelopment = isDevelopment;
const isProduction = () => exports.env.NODE_ENV === 'production';
exports.isProduction = isProduction;
const isTest = () => exports.env.NODE_ENV === 'test';
exports.isTest = isTest;
// Export feature flags
exports.features = {
    aiChat: exports.env.ENABLE_AI_CHAT,
    payment: exports.env.ENABLE_PAYMENT_PROCESSING,
    email: exports.env.ENABLE_EMAIL_NOTIFICATIONS,
    fileUpload: exports.env.ENABLE_FILE_UPLOADS,
    websocket: exports.env.ENABLE_WEBSOCKET,
};
// Export configuration objects
exports.corsOptions = {
    origin: exports.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    credentials: exports.env.CORS_CREDENTIALS,
};
exports.uploadConfig = {
    maxFileSize: exports.env.MAX_FILE_SIZE,
    allowedTypes: exports.env.ALLOWED_FILE_TYPES.split(',').map((type) => type.trim()),
    uploadDir: path_1.default.resolve(exports.env.UPLOAD_DIR),
};
exports.rateLimitConfig = {
    windowMs: exports.env.RATE_LIMIT_WINDOW_MS,
    max: exports.env.RATE_LIMIT_MAX_REQUESTS,
};
// Log configuration on startup (only in development)
if ((0, exports.isDevelopment)()) {
    console.log('🔧 Environment Configuration:');
    console.log(`   Environment: ${exports.env.NODE_ENV}`);
    console.log(`   Port: ${exports.env.PORT}`);
    console.log(`   Database: ${exports.env.DATABASE_URL.split('@')[1] || 'configured'}`);
    console.log(`   Redis: ${exports.env.REDIS_URL ? 'configured' : 'not configured'}`);
    console.log(`   Features: ${Object.entries(exports.features).filter(([_, v]) => v).map(([k]) => k).join(', ')}`);
}
//# sourceMappingURL=env.js.map