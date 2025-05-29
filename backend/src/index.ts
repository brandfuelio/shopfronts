import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import routes from './routes';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { env, corsOptions, isDevelopment, features } from './config/env';
import { initializeWebSocket } from './websocket/server';
import { performanceMonitoring, requestLogging } from './middleware/monitoring';
import { swaggerSpec } from './config/swagger';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: isDevelopment() ? false : undefined,
}));

// CORS configuration
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Logging
if (env.ENABLE_MORGAN) {
  app.use(morgan(isDevelopment() ? 'dev' : 'combined', { 
    stream: { write: (message) => logger.info(message.trim()) } 
  }));
}

// Raw body for Stripe webhooks (must be before JSON parser)
app.use('/api/v1/payment/webhook', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Trust proxy (for deployment behind reverse proxy)
app.set('trust proxy', 1);

// Monitoring middleware
app.use(performanceMonitoring);
app.use(requestLogging);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime()
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ShopFronts API Documentation',
}));

// API info endpoint
app.get(env.API_PREFIX, (_req, res) => {
  res.json({
    name: env.APP_NAME,
    version: '1.0.0',
    description: 'AI-powered digital marketplace API',
    environment: env.NODE_ENV,
    features: {
      aiChat: env.ENABLE_AI_CHAT,
      payment: env.ENABLE_PAYMENT_PROCESSING,
      email: env.ENABLE_EMAIL_NOTIFICATIONS,
      fileUpload: env.ENABLE_FILE_UPLOADS,
      websocket: env.ENABLE_WEBSOCKET,
    },
    endpoints: {
      auth: `${env.API_PREFIX}/auth`,
      products: `${env.API_PREFIX}/products`,
      categories: `${env.API_PREFIX}/categories`,
      cart: `${env.API_PREFIX}/cart`,
      orders: `${env.API_PREFIX}/orders`,
      reviews: `${env.API_PREFIX}/reviews`,
      chat: `${env.API_PREFIX}/chat`,
      users: `${env.API_PREFIX}/users`,
      seller: `${env.API_PREFIX}/seller`,
      admin: `${env.API_PREFIX}/admin`,
      payment: `${env.API_PREFIX}/payment`
    },
    documentation: `${env.APP_URL}/api-docs`
  });
});

// API routes
app.use(env.API_PREFIX, routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket server if enabled
if (features.websocket) {
  initializeWebSocket(httpServer);
}

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT}`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
      logger.info(`📍 API available at ${env.APP_URL}${env.API_PREFIX}`);
      logger.info(`📚 API documentation at ${env.APP_URL}/api-docs`);
      logger.info(`🏥 Health check at ${env.APP_URL}/health`);
      logger.info(`🔧 CORS enabled for: ${corsOptions.origin.join(', ')}`);
      
      if (features.websocket) {
        logger.info(`🔌 WebSocket server running on path ${env.WS_PATH}`);
      }
      
      if (isDevelopment()) {
        logger.info(`📝 Features enabled: ${Object.entries({
          aiChat: env.ENABLE_AI_CHAT,
          payment: env.ENABLE_PAYMENT_PROCESSING,
          email: env.ENABLE_EMAIL_NOTIFICATIONS,
          fileUpload: env.ENABLE_FILE_UPLOADS,
          websocket: env.ENABLE_WEBSOCKET,
        }).filter(([_, v]) => v).map(([k]) => k).join(', ')}`);
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} signal received: closing HTTP server`);
      httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in development
  if (!isDevelopment()) {
    process.exit(1);
  }
});

export default app;