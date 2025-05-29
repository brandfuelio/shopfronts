"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogging = exports.errorMonitoring = exports.performanceMonitoring = void 0;
const monitoring_service_1 = require("../services/monitoring.service");
const perf_hooks_1 = require("perf_hooks");
/**
 * Performance monitoring middleware
 */
const performanceMonitoring = (req, res, next) => {
    // Skip monitoring for health check endpoints
    if (req.path === '/health' || req.path === '/metrics') {
        return next();
    }
    // Record start time
    req.startTime = perf_hooks_1.performance.now();
    // Override res.end to capture response
    const originalEnd = res.end;
    res.end = function (...args) {
        // Calculate response time
        const responseTime = req.startTime ? perf_hooks_1.performance.now() - req.startTime : 0;
        // Track performance metric
        monitoring_service_1.MonitoringService.trackPerformance({
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
exports.performanceMonitoring = performanceMonitoring;
/**
 * Error monitoring middleware
 */
const errorMonitoring = (err, req, res, next) => {
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
        monitoring_service_1.MonitoringService.createAlert('API Error', `${err.message} at ${req.method} ${req.url}`, 'high');
    }
    // Pass to next error handler
    next(err);
};
exports.errorMonitoring = errorMonitoring;
/**
 * Request logging middleware
 */
const requestLogging = (req, res, next) => {
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
        }
        else if (res.statusCode >= 400) {
            console.warn('Client Error:', logData);
        }
        else if (duration > 1000) {
            console.warn('Slow Request:', logData);
        }
    });
    next();
};
exports.requestLogging = requestLogging;
//# sourceMappingURL=monitoring.js.map