"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = require("http");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const routes_1 = __importDefault(require("./routes"));
const logger_1 = require("./utils/logger");
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const server_1 = require("./websocket/server");
const monitoring_1 = require("./middleware/monitoring");
const swagger_1 = require("./config/swagger");
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: (0, env_1.isDevelopment)() ? false : undefined,
}));
// CORS configuration
app.use((0, cors_1.default)(env_1.corsOptions));
// Compression
app.use((0, compression_1.default)());
// Logging
if (env_1.env.ENABLE_MORGAN) {
    app.use((0, morgan_1.default)((0, env_1.isDevelopment)() ? 'dev' : 'combined', {
        stream: { write: (message) => logger_1.logger.info(message.trim()) }
    }));
}
// Raw body for Stripe webhooks (must be before JSON parser)
app.use('/api/v1/payment/webhook', express_1.default.raw({ type: 'application/json' }));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// Trust proxy (for deployment behind reverse proxy)
app.set('trust proxy', 1);
// Monitoring middleware
app.use(monitoring_1.performanceMonitoring);
app.use(monitoring_1.requestLogging);
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env_1.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime()
    });
});
// API Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ShopFronts API Documentation',
}));
// API info endpoint
app.get(env_1.env.API_PREFIX, (_req, res) => {
    res.json({
        name: env_1.env.APP_NAME,
        version: '1.0.0',
        description: 'AI-powered digital marketplace API',
        environment: env_1.env.NODE_ENV,
        features: {
            aiChat: env_1.env.ENABLE_AI_CHAT,
            payment: env_1.env.ENABLE_PAYMENT_PROCESSING,
            email: env_1.env.ENABLE_EMAIL_NOTIFICATIONS,
            fileUpload: env_1.env.ENABLE_FILE_UPLOADS,
            websocket: env_1.env.ENABLE_WEBSOCKET,
        },
        endpoints: {
            auth: `${env_1.env.API_PREFIX}/auth`,
            products: `${env_1.env.API_PREFIX}/products`,
            categories: `${env_1.env.API_PREFIX}/categories`,
            cart: `${env_1.env.API_PREFIX}/cart`,
            orders: `${env_1.env.API_PREFIX}/orders`,
            reviews: `${env_1.env.API_PREFIX}/reviews`,
            chat: `${env_1.env.API_PREFIX}/chat`,
            users: `${env_1.env.API_PREFIX}/users`,
            seller: `${env_1.env.API_PREFIX}/seller`,
            admin: `${env_1.env.API_PREFIX}/admin`,
            payment: `${env_1.env.API_PREFIX}/payment`
        },
        documentation: `${env_1.env.APP_URL}/api-docs`
    });
});
// API routes
app.use(env_1.env.API_PREFIX, routes_1.default);
// Error handling
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// Create HTTP server
const httpServer = (0, http_1.createServer)(app);
// Initialize WebSocket server if enabled
if (env_1.features.websocket) {
    (0, server_1.initializeWebSocket)(httpServer);
}
// Start server
const startServer = async () => {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
        httpServer.listen(env_1.env.PORT, () => {
            logger_1.logger.info(`🚀 Server running on port ${env_1.env.PORT}`);
            logger_1.logger.info(`🌍 Environment: ${env_1.env.NODE_ENV}`);
            logger_1.logger.info(`📍 API available at ${env_1.env.APP_URL}${env_1.env.API_PREFIX}`);
            logger_1.logger.info(`📚 API documentation at ${env_1.env.APP_URL}/api-docs`);
            logger_1.logger.info(`🏥 Health check at ${env_1.env.APP_URL}/health`);
            logger_1.logger.info(`🔧 CORS enabled for: ${env_1.corsOptions.origin.join(', ')}`);
            if (env_1.features.websocket) {
                logger_1.logger.info(`🔌 WebSocket server running on path ${env_1.env.WS_PATH}`);
            }
            if ((0, env_1.isDevelopment)()) {
                logger_1.logger.info(`📝 Features enabled: ${Object.entries({
                    aiChat: env_1.env.ENABLE_AI_CHAT,
                    payment: env_1.env.ENABLE_PAYMENT_PROCESSING,
                    email: env_1.env.ENABLE_EMAIL_NOTIFICATIONS,
                    fileUpload: env_1.env.ENABLE_FILE_UPLOADS,
                    websocket: env_1.env.ENABLE_WEBSOCKET,
                }).filter(([_, v]) => v).map(([k]) => k).join(', ')}`);
            }
        });
        // Graceful shutdown
        const gracefulShutdown = (signal) => {
            logger_1.logger.info(`${signal} signal received: closing HTTP server`);
            httpServer.close(() => {
                logger_1.logger.info('HTTP server closed');
                process.exit(0);
            });
            // Force close after 10 seconds
            setTimeout(() => {
                logger_1.logger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process in development
    if (!(0, env_1.isDevelopment)()) {
        process.exit(1);
    }
});
exports.default = app;
//# sourceMappingURL=index.js.map