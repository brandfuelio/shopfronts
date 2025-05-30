import { Request, Response } from 'express';
import { MonitoringService } from '../services/monitoring.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';

export class MonitoringController {
  /**
   * Health check endpoint
   */
  static healthCheck = asyncHandler(async (_req: Request, res: Response) => {
    const checks = await MonitoringService.performHealthChecks();
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
  static getMetrics = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const metrics = MonitoringService.getSystemMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  });

  /**
   * Get performance statistics
   */
  static getPerformanceStats = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const { hours = 24 } = req.query;
    const stats = await MonitoringService.getPerformanceStats(Number(hours));

    res.json({
      success: true,
      data: stats,
    });
  });

  /**
   * Get error logs
   */
  static getErrorLogs = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const { limit = 100 } = req.query;
    const logs = await MonitoringService.getErrorLogs(Number(limit));

    res.json({
      success: true,
      data: logs,
    });
  });

  /**
   * Create test alert (admin only)
   */
  static createTestAlert = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const { type, message, severity } = req.body;

    await MonitoringService.createAlert(
      type || 'Test Alert',
      message || 'This is a test alert',
      severity || 'low'
    );

    res.json({
      success: true,
      message: 'Test alert created',
    });
  });

  /**
   * Get Prometheus metrics
   */
  static getPrometheusMetrics = asyncHandler(async (_req: Request, res: Response) => {
    // Format metrics in Prometheus format
    const systemMetrics = MonitoringService.getSystemMetrics();
    const performanceStats = await MonitoringService.getPerformanceStats(1);

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
      const endpointStats = stats as any;
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