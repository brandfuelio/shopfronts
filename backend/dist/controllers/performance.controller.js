"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceController = void 0;
const performance_service_1 = require("../services/performance.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const errors_1 = require("../utils/errors");
class PerformanceController {
    /**
     * Get performance analysis
     */
    static getAnalysis = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const analysis = await performance_service_1.PerformanceService.analyzePerformance();
        res.json({
            success: true,
            data: analysis,
        });
    });
    /**
     * Get performance report
     */
    static getReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const report = await performance_service_1.PerformanceService.generateReport();
        res.json({
            success: true,
            data: report,
        });
    });
    /**
     * Run auto-optimization
     */
    static runOptimization = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const actions = await performance_service_1.PerformanceService.autoOptimize();
        res.json({
            success: true,
            data: {
                actions,
                timestamp: new Date(),
            },
        });
    });
    /**
     * Benchmark endpoint
     */
    static benchmarkEndpoint = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const { endpoint, method = 'GET' } = req.body;
        if (!endpoint) {
            throw new errors_1.AppError('Endpoint is required', 400);
        }
        const results = await performance_service_1.PerformanceService.benchmarkEndpoint(endpoint, method);
        res.json({
            success: true,
            data: results,
        });
    });
    /**
     * Get slow queries
     */
    static getSlowQueries = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const threshold = parseInt(req.query.threshold) || 1000;
        const queries = await performance_service_1.PerformanceService.getSlowQueries(threshold);
        res.json({
            success: true,
            data: queries,
        });
    });
    /**
     * Detect memory leaks
     */
    static detectMemoryLeaks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user?.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const result = await performance_service_1.PerformanceService.detectMemoryLeaks();
        res.json({
            success: true,
            data: result,
        });
    });
}
exports.PerformanceController = PerformanceController;
//# sourceMappingURL=performance.controller.js.map