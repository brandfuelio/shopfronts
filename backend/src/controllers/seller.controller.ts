import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { OrderStatus } from '@prisma/client';

// Get seller dashboard stats
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;

    // Get seller profile
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: sellerId }
    });

    if (!sellerProfile) {
      throw new AppError('Seller profile not found', 404);
    }

    // Get stats
    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      monthlyRevenue,
      averageRating
    ] = await Promise.all([
      // Total products
      prisma.product.count({
        where: { sellerId }
      }),
      
      // Active products
      prisma.product.count({
        where: { sellerId, isActive: true }
      }),
      
      // Total orders
      prisma.orderItem.count({
        where: { product: { sellerId } }
      }),
      
      // Pending orders
      prisma.orderItem.count({
        where: {
          product: { sellerId },
          order: { status: OrderStatus.PENDING }
        }
      }),
      
      // Total revenue
      prisma.orderItem.aggregate({
        where: {
          product: { sellerId },
          order: { status: { in: [OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] } }
        },
        _sum: { total: true }
      }),
      
      // Monthly revenue (last 30 days)
      prisma.orderItem.aggregate({
        where: {
          product: { sellerId },
          order: {
            status: { in: [OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] },
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        _sum: { total: true }
      }),
      
      // Average rating
      prisma.review.aggregate({
        where: { product: { sellerId } },
        _avg: { rating: true }
      })
    ]);

    res.json({
      profile: sellerProfile,
      stats: {
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        monthlyRevenue: monthlyRevenue._sum.total || 0,
        averageRating: averageRating._avg.rating || 0,
        commissionRate: sellerProfile.commissionRate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get seller orders
export const getSellerOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where: any = {
      product: { sellerId }
    };

    if (status) {
      where.order = { status: status as OrderStatus };
    }

    const [items, total] = await Promise.all([
      prisma.orderItem.findMany({
        where,
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              thumbnail: true
            }
          }
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.orderItem.count({ where })
    ]);

    res.json({
      items,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Get seller products
export const getSellerProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;
    const { search, category, status, page = 1, limit = 10 } = req.query;

    const where: any = { sellerId };

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: {
              reviews: true,
              orderItems: true
            }
          }
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Update seller profile
export const updateSellerProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;
    const { businessName, description, website, payoutDetails } = req.body;

    const profile = await prisma.sellerProfile.update({
      where: { userId: sellerId },
      data: {
        businessName,
        description,
        website,
        payoutDetails
      }
    });

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// Get seller analytics
export const getSellerAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;
    const { period = '30d' } = req.query;

    // Calculate date range
    let startDate: Date;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get sales by day
    const salesByDay = await prisma.$queryRaw`
      SELECT 
        DATE(o."createdAt") as date,
        COUNT(DISTINCT oi.id) as orders,
        SUM(oi.total) as revenue
      FROM "OrderItem" oi
      JOIN "Order" o ON oi."orderId" = o.id
      JOIN "Product" p ON oi."productId" = p.id
      WHERE p."sellerId" = ${sellerId}
        AND o."createdAt" >= ${startDate}
        AND o.status IN ('DELIVERED', 'PROCESSING', 'SHIPPED')
      GROUP BY DATE(o."createdAt")
      ORDER BY date DESC
    `;

    // Get top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        product: { sellerId },
        order: {
          createdAt: { gte: startDate },
          status: { in: [OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] }
        }
      },
      _count: { id: true },
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10
    });

    // Get product details for top products
    const productIds = topProducts.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, thumbnail: true }
    });

    const topProductsWithDetails = topProducts.map(tp => ({
      ...tp,
      product: products.find(p => p.id === tp.productId)
    }));

    // Get customer demographics
    const customerStats = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        items: {
          some: { product: { sellerId } }
        },
        createdAt: { gte: startDate }
      },
      _count: { id: true },
      _sum: { total: true }
    });

    res.json({
      salesByDay,
      topProducts: topProductsWithDetails,
      customerStats: {
        totalCustomers: customerStats.length,
        repeatCustomers: customerStats.filter(c => c._count && c._count.id > 1).length,
        averageOrderValue: customerStats.reduce((sum, c) => sum + (c._sum?.total || 0), 0) / customerStats.length || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get payout history
export const getPayoutHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;
    // const { page = 1, limit = 10 } = req.query; // TODO: Implement pagination when payment system is integrated

    // This would typically integrate with a payment system
    // For now, we'll calculate theoretical payouts based on delivered orders
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await prisma.orderItem.aggregate({
      where: {
        product: { sellerId },
        order: {
          status: OrderStatus.DELIVERED,
          deliveredAt: { gte: startOfMonth }
        }
      },
      _sum: { total: true }
    });

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: sellerId }
    });

    const commission = (monthlyRevenue._sum.total || 0) * (sellerProfile?.commissionRate || 0.1);
    const netPayout = (monthlyRevenue._sum.total || 0) - commission;

    res.json({
      currentMonth: {
        revenue: monthlyRevenue._sum.total || 0,
        commission,
        netPayout,
        status: 'pending'
      },
      history: [] // Would be populated from payment system
    });
  } catch (error) {
    next(error);
  }
};