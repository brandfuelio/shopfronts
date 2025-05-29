"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const prisma_1 = require("../lib/prisma");
const logger_1 = require("../utils/logger");
const ioredis_1 = require("ioredis");
const env_1 = require("../config/env");
class AnalyticsService {
    static redis = null;
    static initialize() {
        if (env_1.config.REDIS_URL) {
            this.redis = new ioredis_1.Redis(env_1.config.REDIS_URL);
        }
    }
    /**
     * Track generic analytics event
     */
    static async trackEvent(event) {
        try {
            // Store in database for long-term analytics
            await prisma_1.prisma.$executeRaw `
        INSERT INTO analytics_events (user_id, session_id, event, category, properties, timestamp)
        VALUES (${event.userId}, ${event.sessionId}, ${event.event}, ${event.category}, 
                ${JSON.stringify(event.properties)}, ${event.timestamp || new Date()})
      `;
            // Store in Redis for real-time analytics
            if (this.redis) {
                const key = `analytics:${event.category}:${new Date().toISOString().split('T')[0]}`;
                await this.redis.hincrby(key, event.event, 1);
                await this.redis.expire(key, 86400 * 30); // Keep for 30 days
            }
            logger_1.logger.debug('Analytics event tracked', { event });
        }
        catch (error) {
            logger_1.logger.error('Failed to track analytics event', { error, event });
        }
    }
    /**
     * Track product view
     */
    static async trackProductView(view) {
        try {
            // Update product view count
            await prisma_1.prisma.product.update({
                where: { id: view.productId },
                data: { viewCount: { increment: 1 } },
            });
            // Track detailed view
            await this.trackEvent({
                userId: view.userId,
                sessionId: view.sessionId,
                event: 'product_view',
                category: 'engagement',
                properties: {
                    productId: view.productId,
                    referrer: view.referrer,
                    duration: view.duration,
                },
            });
            // Update trending products in Redis
            if (this.redis) {
                const trendingKey = `trending:products:${new Date().toISOString().split('T')[0]}`;
                await this.redis.zincrby(trendingKey, 1, view.productId);
                await this.redis.expire(trendingKey, 86400 * 7); // Keep for 7 days
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to track product view', { error, view });
        }
    }
    /**
     * Track search query
     */
    static async trackSearch(search) {
        try {
            await this.trackEvent({
                userId: search.userId,
                sessionId: search.sessionId,
                event: 'search',
                category: 'search',
                properties: {
                    query: search.query,
                    resultsCount: search.resultsCount,
                    clickedResults: search.clickedResults,
                },
            });
            // Track popular searches in Redis
            if (this.redis) {
                const searchKey = `popular:searches:${new Date().toISOString().split('T')[0]}`;
                await this.redis.zincrby(searchKey, 1, search.query.toLowerCase());
                await this.redis.expire(searchKey, 86400 * 30); // Keep for 30 days
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to track search', { error, search });
        }
    }
    /**
     * Track conversion (purchase)
     */
    static async trackConversion(data) {
        try {
            await this.trackEvent({
                userId: data.userId,
                sessionId: data.sessionId,
                event: 'purchase',
                category: 'conversion',
                properties: {
                    orderId: data.orderId,
                    products: data.products,
                    total: data.total,
                },
            });
            // Update product sales metrics
            for (const product of data.products) {
                await prisma_1.prisma.product.update({
                    where: { id: product.id },
                    data: {
                        salesCount: { increment: product.quantity },
                    },
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to track conversion', { error, data });
        }
    }
    /**
     * Get dashboard analytics
     */
    static async getDashboardAnalytics(sellerId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            // Base query conditions
            const productWhere = sellerId ? { sellerId } : {};
            const orderWhere = sellerId ? { items: { some: { product: { sellerId } } } } : {};
            // Get key metrics
            const [totalRevenue, totalOrders, totalProducts, activeUsers] = await Promise.all([
                prisma_1.prisma.order.aggregate({
                    where: { ...orderWhere, createdAt: { gte: thirtyDaysAgo } },
                    _sum: { total: true },
                }),
                prisma_1.prisma.order.count({
                    where: { ...orderWhere, createdAt: { gte: thirtyDaysAgo } },
                }),
                prisma_1.prisma.product.count({
                    where: { ...productWhere, status: 'ACTIVE' },
                }),
                prisma_1.prisma.user.count({
                    where: { lastLogin: { gte: thirtyDaysAgo } },
                }),
            ]);
            // Get trending products from Redis
            let trendingProducts = [];
            if (this.redis) {
                const trendingKey = `trending:products:${today.toISOString().split('T')[0]}`;
                const trending = await this.redis.zrevrange(trendingKey, 0, 9, 'WITHSCORES');
                const productIds = [];
                for (let i = 0; i < trending.length; i += 2) {
                    productIds.push(trending[i]);
                }
                if (productIds.length > 0) {
                    trendingProducts = await prisma_1.prisma.product.findMany({
                        where: {
                            id: { in: productIds },
                            ...(sellerId && { sellerId }),
                        },
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            images: true,
                            viewCount: true,
                        },
                    });
                }
            }
            // Get revenue over time
            const revenueOverTime = await prisma_1.prisma.$queryRaw `
        SELECT 
          DATE(created_at) as date,
          SUM(total) as revenue,
          COUNT(*) as orders
        FROM orders
        WHERE created_at >= ${thirtyDaysAgo}
        ${sellerId ? prisma_1.prisma.$queryRaw `AND id IN (
          SELECT DISTINCT order_id 
          FROM order_items oi 
          JOIN products p ON oi.product_id = p.id 
          WHERE p.seller_id = ${sellerId}
        )` : prisma_1.prisma.$queryRaw ``}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
            return {
                overview: {
                    totalRevenue: totalRevenue._sum.total || 0,
                    totalOrders,
                    totalProducts,
                    activeUsers: sellerId ? null : activeUsers,
                    averageOrderValue: totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0,
                },
                trendingProducts,
                revenueOverTime,
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get dashboard analytics', { error });
            throw error;
        }
    }
    /**
     * Get product analytics
     */
    static async getProductAnalytics(productId) {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const [product, viewsOverTime, conversionRate] = await Promise.all([
                prisma_1.prisma.product.findUnique({
                    where: { id: productId },
                    include: {
                        _count: {
                            select: {
                                reviews: true,
                                orderItems: true,
                            },
                        },
                    },
                }),
                prisma_1.prisma.$queryRaw `
          SELECT 
            DATE(timestamp) as date,
            COUNT(*) as views
          FROM analytics_events
          WHERE event = 'product_view'
            AND properties->>'productId' = ${productId}
            AND timestamp >= ${thirtyDaysAgo}
          GROUP BY DATE(timestamp)
          ORDER BY date DESC
        `,
                prisma_1.prisma.$queryRaw `
          SELECT 
            COUNT(DISTINCT CASE WHEN event = 'product_view' THEN session_id END) as views,
            COUNT(DISTINCT CASE WHEN event = 'add_to_cart' THEN session_id END) as carts,
            COUNT(DISTINCT CASE WHEN event = 'purchase' THEN session_id END) as purchases
          FROM analytics_events
          WHERE properties->>'productId' = ${productId}
            AND timestamp >= ${thirtyDaysAgo}
        `,
            ]);
            return {
                product: {
                    ...product,
                    conversionRate: conversionRate[0]?.views > 0
                        ? (conversionRate[0]?.purchases / conversionRate[0]?.views) * 100
                        : 0,
                    cartRate: conversionRate[0]?.views > 0
                        ? (conversionRate[0]?.carts / conversionRate[0]?.views) * 100
                        : 0,
                },
                viewsOverTime,
                funnel: conversionRate[0],
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get product analytics', { error });
            throw error;
        }
    }
    /**
     * Get search analytics
     */
    static async getSearchAnalytics() {
        try {
            if (!this.redis) {
                return { popularSearches: [], searchTrends: [] };
            }
            const today = new Date().toISOString().split('T')[0];
            const searchKey = `popular:searches:${today}`;
            // Get top searches
            const popularSearches = await this.redis.zrevrange(searchKey, 0, 19, 'WITHSCORES');
            const searches = [];
            for (let i = 0; i < popularSearches.length; i += 2) {
                searches.push({
                    query: popularSearches[i],
                    count: parseInt(popularSearches[i + 1]),
                });
            }
            // Get search trends over time
            const searchTrends = await prisma_1.prisma.$queryRaw `
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as searches,
          COUNT(DISTINCT user_id) as unique_users,
          AVG((properties->>'resultsCount')::int) as avg_results
        FROM analytics_events
        WHERE event = 'search'
          AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `;
            return {
                popularSearches: searches,
                searchTrends,
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get search analytics', { error });
            throw error;
        }
    }
    /**
     * Get user behavior analytics
     */
    static async getUserAnalytics(userId) {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const [userActivity, purchaseHistory, viewedProducts] = await Promise.all([
                prisma_1.prisma.$queryRaw `
          SELECT 
            event,
            category,
            COUNT(*) as count
          FROM analytics_events
          WHERE user_id = ${userId}
            AND timestamp >= ${thirtyDaysAgo}
          GROUP BY event, category
        `,
                prisma_1.prisma.order.findMany({
                    where: {
                        userId,
                        createdAt: { gte: thirtyDaysAgo },
                    },
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        price: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                }),
                prisma_1.prisma.$queryRaw `
          SELECT DISTINCT
            properties->>'productId' as product_id,
            MAX(timestamp) as last_viewed
          FROM analytics_events
          WHERE user_id = ${userId}
            AND event = 'product_view'
            AND timestamp >= ${thirtyDaysAgo}
          GROUP BY properties->>'productId'
          ORDER BY last_viewed DESC
          LIMIT 20
        `,
            ]);
            return {
                activity: userActivity,
                purchaseHistory,
                recentlyViewed: viewedProducts,
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get user analytics', { error });
            throw error;
        }
    }
}
exports.AnalyticsService = AnalyticsService;
// Initialize analytics service
AnalyticsService.initialize();
//# sourceMappingURL=analytics.service.js.map