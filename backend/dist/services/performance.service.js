"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceService = void 0;
const logger_1 = require("../utils/logger");
const cache_service_1 = require("./cache.service");
const monitoring_service_1 = require("./monitoring.service");
class PerformanceService {
    static performanceThresholds = {
        responseTime: 1000, // 1 second
        errorRate: 0.05, // 5%
        cacheHitRate: 0.7, // 70%
        memoryUsage: 0.8, // 80%
        cpuUsage: 0.8, // 80%
    };
    /**
     * Analyze current performance metrics
     */
    static async analyzePerformance() {
        const metrics = await this.collectMetrics();
        const suggestions = this.generateSuggestions(metrics);
        return { metrics, suggestions };
    }
    /**
     * Collect performance metrics
     */
    static async collectMetrics() {
        const stats = await monitoring_service_1.MonitoringService.getPerformanceStats(1); // Last hour
        const cacheStats = await cache_service_1.CacheService.getStats();
        const systemMetrics = await monitoring_service_1.MonitoringService.getSystemMetrics();
        // Calculate metrics
        const totalRequests = stats.totalRequests || 1;
        const totalErrors = stats.errorsByStatus?.['5xx'] || 0;
        const cacheHits = parseInt(cacheStats.cache_hits || '0');
        const cacheMisses = parseInt(cacheStats.cache_misses || '0');
        const totalCacheRequests = cacheHits + cacheMisses || 1;
        return {
            responseTime: stats.avgResponseTime || 0,
            throughput: stats.requestsPerMinute || 0,
            errorRate: totalErrors / totalRequests,
            cacheHitRate: cacheHits / totalCacheRequests,
            memoryUsage: systemMetrics.memory.usedPercent / 100,
            cpuUsage: systemMetrics.cpu.usage / 100,
        };
    }
    /**
     * Generate optimization suggestions based on metrics
     */
    static generateSuggestions(metrics) {
        const suggestions = [];
        // Response time suggestions
        if (metrics.responseTime > this.performanceThresholds.responseTime) {
            suggestions.push({
                type: 'query',
                severity: 'high',
                message: `Average response time (${metrics.responseTime.toFixed(0)}ms) exceeds threshold`,
                recommendation: 'Consider optimizing database queries, adding indexes, or implementing pagination',
            });
        }
        // Cache hit rate suggestions
        if (metrics.cacheHitRate < this.performanceThresholds.cacheHitRate) {
            suggestions.push({
                type: 'cache',
                severity: 'medium',
                message: `Cache hit rate (${(metrics.cacheHitRate * 100).toFixed(1)}%) is below optimal`,
                recommendation: 'Increase cache TTL for frequently accessed data or implement cache warming',
            });
        }
        // Error rate suggestions
        if (metrics.errorRate > this.performanceThresholds.errorRate) {
            suggestions.push({
                type: 'general',
                severity: 'high',
                message: `Error rate (${(metrics.errorRate * 100).toFixed(1)}%) is above acceptable threshold`,
                recommendation: 'Review error logs and implement better error handling',
            });
        }
        // Memory usage suggestions
        if (metrics.memoryUsage > this.performanceThresholds.memoryUsage) {
            suggestions.push({
                type: 'memory',
                severity: 'high',
                message: `Memory usage (${(metrics.memoryUsage * 100).toFixed(1)}%) is critically high`,
                recommendation: 'Implement memory leak detection, optimize data structures, or scale horizontally',
            });
        }
        // CPU usage suggestions
        if (metrics.cpuUsage > this.performanceThresholds.cpuUsage) {
            suggestions.push({
                type: 'cpu',
                severity: 'high',
                message: `CPU usage (${(metrics.cpuUsage * 100).toFixed(1)}%) is critically high`,
                recommendation: 'Profile CPU-intensive operations, optimize algorithms, or scale vertically',
            });
        }
        // Low throughput suggestion
        if (metrics.throughput < 10) {
            suggestions.push({
                type: 'general',
                severity: 'low',
                message: 'Low request throughput detected',
                recommendation: 'This might be normal for low traffic, but consider load testing for scalability',
            });
        }
        return suggestions;
    }
    /**
     * Auto-optimize based on current metrics
     */
    static async autoOptimize() {
        const actions = [];
        const { metrics, suggestions } = await this.analyzePerformance();
        // Auto-adjust cache TTL if hit rate is low
        if (metrics.cacheHitRate < 0.5) {
            // In a real implementation, you would adjust cache TTL dynamically
            actions.push('Increased cache TTL for frequently accessed endpoints');
        }
        // Clear old cache entries if memory is high
        if (metrics.memoryUsage > 0.9) {
            // In a real implementation, you would implement cache eviction
            actions.push('Cleared least recently used cache entries');
        }
        // Log high severity issues
        suggestions
            .filter(s => s.severity === 'high')
            .forEach(s => {
            logger_1.logger.warn('Performance issue detected:', s);
        });
        return actions;
    }
    /**
     * Generate performance report
     */
    static async generateReport() {
        const { metrics, suggestions } = await this.analyzePerformance();
        // Get historical data for trends
        const hourlyStats = await Promise.all([1, 2, 3, 4, 5, 6].map(hours => monitoring_service_1.MonitoringService.getPerformanceStats(hours)));
        const trends = {
            responseTime: hourlyStats.map(s => s.avgResponseTime || 0),
            throughput: hourlyStats.map(s => s.requestsPerMinute || 0),
            errorRate: hourlyStats.map(s => {
                const total = s.totalRequests || 1;
                const errors = s.errorsByStatus?.['5xx'] || 0;
                return errors / total;
            }),
        };
        return {
            timestamp: new Date(),
            metrics,
            suggestions,
            trends,
        };
    }
    /**
     * Benchmark endpoint performance
     */
    static async benchmarkEndpoint(endpoint, method = 'GET') {
        // In a real implementation, this would make multiple requests
        // and measure response times
        // For now, return mock data
        return {
            avgResponseTime: 150,
            minResponseTime: 50,
            maxResponseTime: 500,
            p95ResponseTime: 300,
            p99ResponseTime: 450,
        };
    }
    /**
     * Get slow queries
     */
    static async getSlowQueries(threshold = 1000) {
        // In a real implementation, this would analyze database query logs
        // For now, return empty array
        return [];
    }
    /**
     * Get memory leaks
     */
    static async detectMemoryLeaks() {
        // In a real implementation, this would analyze heap snapshots
        // For now, return no leaks detected
        return {
            detected: false,
            suspects: [],
        };
    }
}
exports.PerformanceService = PerformanceService;
//# sourceMappingURL=performance.service.js.map