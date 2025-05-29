import { Request, Response, NextFunction } from 'express';
import { MonitoringService } from '../services/monitoring.service';
import { performance } from 'perf_hooks';

declare global {
  namespace Express {
    interface Request {
      startTime?: number;
    }
  }
}

/**
 * Performance monitoring middleware
 */
export const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  // Skip monitoring for health check endpoints
  if (req.path === '/health' || req.path === '/metrics') {
    return next();
  }

  // Record start time
  req.startTime = performance.now();

  // Override res.end to capture response
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    // Calculate response time
    const responseTime = req.startTime ? performance.now() - req.startTime : 0;

    // Track performance metric
    MonitoringService.trackPerformance({
      endpoint: req.route?.path || req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date(),
    });

    // Call original end
    return originalEnd.apply(res, args);
  };

  next();
};

/**
 * Error monitoring middleware
 */
export const errorMonitoring = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error details
  const errorDetails = {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
    timestamp: new Date(),
  };

  // Create alert for critical errors
  if (res.statusCode >= 500) {
    MonitoringService.createAlert(
      'API Error',
      `${err.message} at ${req.method} ${req.url}`,
      'high'
    );
  }

  // Pass to next error handler
  next(err);
};

/**
 * Request logging middleware
 */
export const requestLogging = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      console.error('Server Error:', logData);
    } else if (res.statusCode >= 400) {
      console.warn('Client Error:', logData);
    } else if (duration > 1000) {
      console.warn('Slow Request:', logData);
    }
  });

  next();
};