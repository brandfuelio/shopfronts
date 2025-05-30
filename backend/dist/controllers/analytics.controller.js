"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const errors_1 = require("../utils/errors");
const prisma_1 = require("../lib/prisma");
class AnalyticsController {
    /**
     * Track event
     */
    static trackEvent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { event, category, properties } = req.body;
        const sessionId = req.headers['x-session-id'] || req.sessionID;
        await analytics_service_1.AnalyticsService.trackEvent({
            userId: req.user?.id,
            sessionId,
            event,
            category,
            properties,
        });
        res.json({
            success: true,
            message: 'Event tracked',
        });
    });
    /**
     * Track product view
     */
    static trackProductView = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { productId } = req.params;
        const { referrer, duration } = req.body;
        const sessionId = req.headers['x-session-id'] || req.sessionID;
        await analytics_service_1.AnalyticsService.trackProductView({
            productId,
            userId: req.user?.id,
            sessionId,
            referrer,
            duration,
        });
        res.json({
            success: true,
            message: 'Product view tracked',
        });
    });
    /**
     * Track search
     */
    static trackSearch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { query, resultsCount, clickedResults } = req.body;
        const sessionId = req.headers['x-session-id'] || req.sessionID;
        await analytics_service_1.AnalyticsService.trackSearch({
            query,
            userId: req.user?.id,
            sessionId,
            resultsCount,
            clickedResults,
        });
        res.json({
            success: true,
            message: 'Search tracked',
        });
    });
    /**
     * Get dashboard analytics
     */
    static getDashboardAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        let sellerId;
        // Check user role and permissions
        if (req.user.role === 'SELLER') {
            sellerId = req.user.id;
        }
        else if (req.user.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const analytics = await analytics_service_1.AnalyticsService.getDashboardAnalytics(sellerId);
        res.json({
            success: true,
            data: analytics,
        });
    });
    /**
     * Get product analytics
     */
    static getProductAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { productId } = req.params;
        // Verify access to product analytics
        if (req.user.role === 'SELLER') {
            const product = await prisma_1.prisma.product.findUnique({
                where: { id: productId },
                select: { sellerId: true },
            });
            if (!product || product.sellerId !== req.user.id) {
                throw new errors_1.AppError('Unauthorized', 403);
            }
        }
        else if (req.user.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const analytics = await analytics_service_1.AnalyticsService.getProductAnalytics(productId);
        res.json({
            success: true,
            data: analytics,
        });
    });
    /**
     * Get search analytics (admin only)
     */
    static getSearchAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const analytics = await analytics_service_1.AnalyticsService.getSearchAnalytics();
        res.json({
            success: true,
            data: analytics,
        });
    });
    /**
     * Get user analytics
     */
    static getUserAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { userId } = req.params;
        // Users can only view their own analytics, admins can view any
        if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        const analytics = await analytics_service_1.AnalyticsService.getUserAnalytics(userId);
        res.json({
            success: true,
            data: analytics,
        });
    });
    /**
     * Export analytics data (admin only)
     */
    static exportAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.user.role !== 'ADMIN') {
            throw new errors_1.AppError('Unauthorized', 403);
        }
        // const { startDate, endDate, type } = req.query;
        // TODO: Implement export functionality
        res.json({
            success: true,
            message: 'Export functionality not yet implemented',
        });
    });
}
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map