import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { prisma } from '../lib/prisma';

export class AnalyticsController {
  /**
   * Track event
   */
  static trackEvent = asyncHandler(async (req: Request, res: Response) => {
    const { event, category, properties } = req.body;
    const sessionId = req.headers['x-session-id'] as string || req.sessionID;

    await AnalyticsService.trackEvent({
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
  static trackProductView = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { referrer, duration } = req.body;
    const sessionId = req.headers['x-session-id'] as string || req.sessionID;

    await AnalyticsService.trackProductView({
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
  static trackSearch = asyncHandler(async (req: Request, res: Response) => {
    const { query, resultsCount, clickedResults } = req.body;
    const sessionId = req.headers['x-session-id'] as string || req.sessionID;

    await AnalyticsService.trackSearch({
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
  static getDashboardAnalytics = asyncHandler(async (req: Request, res: Response) => {
    let sellerId: string | undefined;

    // Check user role and permissions
    if (req.user!.role === 'SELLER') {
      sellerId = req.user!.id;
    } else if (req.user!.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const analytics = await AnalyticsService.getDashboardAnalytics(sellerId);

    res.json({
      success: true,
      data: analytics,
    });
  });

  /**
   * Get product analytics
   */
  static getProductAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;

    // Verify access to product analytics
    if (req.user!.role === 'SELLER') {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { sellerId: true },
      });

      if (!product || product.sellerId !== req.user!.id) {
        throw new AppError('Unauthorized', 403);
      }
    } else if (req.user!.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const analytics = await AnalyticsService.getProductAnalytics(productId);

    res.json({
      success: true,
      data: analytics,
    });
  });

  /**
   * Get search analytics (admin only)
   */
  static getSearchAnalytics = asyncHandler(async (req: Request, res: Response) => {
    if (req.user!.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const analytics = await AnalyticsService.getSearchAnalytics();

    res.json({
      success: true,
      data: analytics,
    });
  });

  /**
   * Get user analytics
   */
  static getUserAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    // Users can only view their own analytics, admins can view any
    if (req.user!.role !== 'ADMIN' && req.user!.id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    const analytics = await AnalyticsService.getUserAnalytics(userId);

    res.json({
      success: true,
      data: analytics,
    });
  });

  /**
   * Export analytics data (admin only)
   */
  static exportAnalytics = asyncHandler(async (req: Request, res: Response) => {
    if (req.user!.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    const { startDate, endDate, type } = req.query;

    // TODO: Implement export functionality
    res.json({
      success: true,
      message: 'Export functionality not yet implemented',
    });
  });
}