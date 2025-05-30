"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const prisma_1 = require("../lib/prisma");
const logger_1 = require("../utils/logger");
const ioredis_1 = require("ioredis");
const env_1 = require("../config/env");
const os_1 = __importDefault(require("os"));
const perf_hooks_1 = require("perf_hooks");
class MonitoringService {
    static redis = null;
    static performanceBuffer = [];
    static flushInterval;
    static initialize() {
        if (env_1.config.REDIS_URL) {
            this.redis = new ioredis_1.Redis(env_1.config.REDIS_URL);
        }
        // Flush performance metrics every 30 seconds
        this.flushInterval = setInterval(() => {
            this.flushPerformanceMetrics();
        }, 30000);
    }
    /**
     * Perform health checks on all services
     */
    static async performHealthChecks() {
        const checks = [];
        // Database health check
        checks.push(await this.checkDatabase());
        // Redis health check
        if (this.redis) {
            checks.push(await this.checkRedis());
        }
        // External services health checks
        checks.push(await this.checkStripe());
        checks.push(await this.checkOpenAI());
        checks.push(await this.checkEmail());
        return checks;
    }
    /**
     * Check database health
     */
    static async checkDatabase() {
        const start = perf_hooks_1.performance.now();
        try {
            await prisma_1.prisma.$queryRaw `SELECT 1`;
            const responseTime = perf_hooks_1.performance.now() - start;
            return {
                service: 'database',
                status: responseTime < 100 ? 'healthy' : 'degraded',
                responseTime,
            };
        }
        catch (error) {
            return {
                service: 'database',
                status: 'unhealthy',
                error: error.message,
            };
        }
    }
    /**
     * Check Redis health
     */
    static async checkRedis() {
        if (!this.redis) {
            return {
                service: 'redis',
                status: 'unhealthy',
                error: 'Redis not configured',
            };
        }
        const start = perf_hooks_1.performance.now();
        try {
            await this.redis.ping();
            const responseTime = perf_hooks_1.performance.now() - start;
            return {
                service: 'redis',
                status: responseTime < 50 ? 'healthy' : 'degraded',
                responseTime,
            };
        }
        catch (error) {
            return {
                service: 'redis',
                status: 'unhealthy',
                error: error.message,
            };
        }
    }
    /**
     * Check Stripe health
     */
    static async checkStripe() {
        // Simple check - in production, you might want to make a test API call
        return {
            service: 'stripe',
            status: env_1.config.STRIPE_SECRET_KEY ? 'healthy' : 'unhealthy',
            error: !env_1.config.STRIPE_SECRET_KEY ? 'Stripe not configured' : undefined,
        };
    }
    /**
     * Check OpenAI health
     */
    static async checkOpenAI() {
        // Simple check - in production, you might want to make a test API call
        return {
            service: 'openai',
            status: env_1.config.OPENAI_API_KEY ? 'healthy' : 'unhealthy',
            error: !env_1.config.OPENAI_API_KEY ? 'OpenAI not configured' : undefined,
        };
    }
    /**
     * Check email service health
     */
    static async checkEmail() {
        // Simple check - in production, you might want to send a test email
        return {
            service: 'email',
            status: env_1.config.SMTP_HOST ? 'healthy' : 'unhealthy',
            error: !env_1.config.SMTP_HOST ? 'Email service not configured' : undefined,
        };
    }
    /**
     * Get system metrics
     */
    static getSystemMetrics() {
        const totalMem = os_1.default.totalmem();
        const freeMem = os_1.default.freemem();
        const usedMem = totalMem - freeMem;
        return {
            cpu: {
                usage: os_1.default.loadavg()[0] * 100, // 1-minute load average as percentage
                loadAverage: os_1.default.loadavg(),
            },
            memory: {
                total: totalMem,
                used: usedMem,
                free: freeMem,
                percentage: (usedMem / totalMem) * 100,
            },
            uptime: os_1.default.uptime(),
            timestamp: new Date(),
        };
    }
    /**
     * Track API performance
     */
    static trackPerformance(metric) {
        this.performanceBuffer.push(metric);
        // Flush if buffer is getting large
        if (this.performanceBuffer.length >= 100) {
            this.flushPerformanceMetrics();
        }
    }
    /**
     * Flush performance metrics to storage
     */
    static async flushPerformanceMetrics() {
        if (this.performanceBuffer.length === 0)
            return;
        const metrics = [...this.performanceBuffer];
        this.performanceBuffer = [];
        try {
            // Store in Redis for real-time monitoring
            if (this.redis) {
                const pipeline = this.redis.pipeline();
                const hourKey = `metrics:${new Date().toISOString().slice(0, 13)}`;
                for (const metric of metrics) {
                    const key = `${metric.method}:${metric.endpoint}:${metric.statusCode}`;
                    pipeline.hincrby(`${hourKey}:count`, key, 1);
                    pipeline.hincrbyfloat(`${hourKey}:time`, key, metric.responseTime);
                }
                pipeline.expire(`${hourKey}:count`, 86400); // Keep for 24 hours
                pipeline.expire(`${hourKey}:time`, 86400);
                await pipeline.exec();
            }
            // Log slow requests
            const slowRequests = metrics.filter(m => m.responseTime > 1000);
            if (slowRequests.length > 0) {
                logger_1.logger.warn('Slow requests detected', { slowRequests });
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to flush performance metrics', { error });
        }
    }
    /**
     * Get performance statistics
     */
    static async getPerformanceStats(hours = 24) {
        if (!this.redis) {
            return { message: 'Redis not available for performance stats' };
        }
        const stats = {
            endpoints: {},
            summary: {
                totalRequests: 0,
                averageResponseTime: 0,
                slowRequests: 0,
                errorRate: 0,
            },
        };
        try {
            // Get stats for the last N hours
            const now = new Date();
            for (let i = 0; i < hours; i++) {
                const hour = new Date(now.getTime() - i * 3600000);
                const hourKey = `metrics:${hour.toISOString().slice(0, 13)}`;
                const [counts, times] = await Promise.all([
                    this.redis.hgetall(`${hourKey}:count`),
                    this.redis.hgetall(`${hourKey}:time`),
                ]);
                for (const [key, count] of Object.entries(counts)) {
                    const [method, endpoint, statusCode] = key.split(':');
                    const endpointKey = `${method} ${endpoint}`;
                    if (!stats.endpoints[endpointKey]) {
                        stats.endpoints[endpointKey] = {
                            count: 0,
                            totalTime: 0,
                            errors: 0,
                            statusCodes: {},
                        };
                    }
                    const requestCount = parseInt(count);
                    const totalTime = parseFloat(times[key] || '0');
                    stats.endpoints[endpointKey].count += requestCount;
                    stats.endpoints[endpointKey].totalTime += totalTime;
                    stats.endpoints[endpointKey].statusCodes[statusCode] =
                        (stats.endpoints[endpointKey].statusCodes[statusCode] || 0) + requestCount;
                    if (parseInt(statusCode) >= 400) {
                        stats.endpoints[endpointKey].errors += requestCount;
                    }
                    stats.summary.totalRequests += requestCount;
                    if (totalTime / requestCount > 1000) {
                        stats.summary.slowRequests += requestCount;
                    }
                }
            }
            // Calculate averages
            let totalTime = 0;
            let totalErrors = 0;
            for (const endpoint of Object.values(stats.endpoints)) {
                endpoint.averageResponseTime = endpoint.totalTime / endpoint.count;
                totalTime += endpoint.totalTime;
                totalErrors += endpoint.errors;
            }
            stats.summary.averageResponseTime = totalTime / stats.summary.totalRequests;
            stats.summary.errorRate = (totalErrors / stats.summary.totalRequests) * 100;
            return stats;
        }
        catch (error) {
            logger_1.logger.error('Failed to get performance stats', { error });
            throw error;
        }
    }
    /**
     * Get error logs
     */
    static async getErrorLogs(_limit = 100) {
        // In a real implementation, you would query your logging system
        // This is a placeholder that returns recent errors from memory
        return [];
    }
    /**
     * Create system alert
     */
    static async createAlert(type, message, severity) {
        logger_1.logger.error(`System Alert [${severity.toUpperCase()}]: ${type}`, { message });
        // In production, you would:
        // 1. Send notifications (email, Slack, PagerDuty, etc.)
        // 2. Store in database for audit trail
        // 3. Trigger automated responses if configured
    }
    /**
     * Cleanup resources
     */
    static cleanup() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        this.flushPerformanceMetrics();
    }
}
exports.MonitoringService = MonitoringService;
// Initialize monitoring service
MonitoringService.initialize();
//# sourceMappingURL=monitoring.service.js.map