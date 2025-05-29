"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringController = void 0;
const monitoring_service_1 = require("../services/monitoring.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const errors_1 = require("../utils/errors");
class MonitoringController {
    /**
     * Health check endpoint
     */
    static healthCheck = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const checks = await monitoring_service_1.MonitoringService.performHealthChecks();
        const allHealthy = checks.every(check => check.status === 'healthy');
        const hasDegraded = checks.some(check => check.status === 'degraded');
        const status = allHealthy ? 'healthy' : hasDegraded ? 'degraded' : 'unhealthy';
        const statusCode = allHealthy ? 200 : hasDegraded ? 200 : 503;
        res.status(statusCode).json({
            status,
            timestamp: new Date(),
            checks,
        });
    });
    /**
     * Get system metrics
     */
    static getMetrics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const metrics = monitoring_service_1.MonitoringService.getSystemMetrics();
        res.json({
            success: true,
            data: metrics,
        });
    });
    /**
     * Get performance statistics
     */
    static getPerformanceStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const { hours = 24 } = req.query;
        const stats = await monitoring_service_1.MonitoringService.getPerformanceStats(Number(hours));
        res.json({
            success: true,
            data: stats,
        });
    });
    /**
     * Get error logs
     */
    static getErrorLogs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const { limit = 100 } = req.query;
        const logs = await monitoring_service_1.MonitoringService.getErrorLogs(Number(limit));
        res.json({
            success: true,
            data: logs,
        });
    });
    /**
     * Create test alert (admin only)
     */
    static createTestAlert = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const { type, message, severity } = req.body;
        await monitoring_service_1.MonitoringService.createAlert(type || 'Test Alert', message || 'This is a test alert', severity || 'low');
        res.json({
            success: true,
            message: 'Test alert created',
        });
    });
    /**
     * Get Prometheus metrics
     */
    static getPrometheusMetrics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        // Format metrics in Prometheus format
        const systemMetrics = monitoring_service_1.MonitoringService.getSystemMetrics();
        const performanceStats = await monitoring_service_1.MonitoringService.getPerformanceStats(1);
        let output = '';
        // System metrics
        output += `# HELP system_cpu_usage CPU usage percentage\n`;
        output += `# TYPE system_cpu_usage gauge\n`;
        output += `system_cpu_usage ${systemMetrics.cpu.usage}\n\n`;
        output += `# HELP system_memory_usage_bytes Memory usage in bytes\n`;
        output += `# TYPE system_memory_usage_bytes gauge\n`;
        output += `system_memory_usage_bytes ${systemMetrics.memory.used}\n\n`;
        output += `# HELP system_memory_total_bytes Total memory in bytes\n`;
        output += `# TYPE system_memory_total_bytes gauge\n`;
        output += `system_memory_total_bytes ${systemMetrics.memory.total}\n\n`;
        output += `# HELP system_uptime_seconds System uptime in seconds\n`;
        output += `# TYPE system_uptime_seconds counter\n`;
        output += `system_uptime_seconds ${systemMetrics.uptime}\n\n`;
        // API metrics
        output += `# HELP api_requests_total Total number of API requests\n`;
        output += `# TYPE api_requests_total counter\n`;
        output += `api_requests_total ${performanceStats.summary?.totalRequests || 0}\n\n`;
        output += `# HELP api_request_duration_seconds API request duration in seconds\n`;
        output += `# TYPE api_request_duration_seconds histogram\n`;
        // Per-endpoint metrics
        for (const [endpoint, stats] of Object.entries(performanceStats.endpoints || {})) {
            const endpointStats = stats;
            const [method, path] = endpoint.split(' ');
            for (const [statusCode, count] of Object.entries(endpointStats.statusCodes || {})) {
                output += `api_requests_total{method="${method}",endpoint="${path}",status="${statusCode}"} ${count}\n`;
            }
            if (endpointStats.averageResponseTime) {
                output += `api_request_duration_seconds{method="${method}",endpoint="${path}"} ${endpointStats.averageResponseTime / 1000}\n`;
            }
        }
        res.set('Content-Type', 'text/plain');
        res.send(output);
    });
}
exports.MonitoringController = MonitoringController;
//# sourceMappingURL=monitoring.controller.js.map