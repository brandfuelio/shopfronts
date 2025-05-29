import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { UserRole, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Get admin dashboard stats
export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue,
      monthlyRevenue,
      pendingOrders,
      activeUsers
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total sellers
      prisma.user.count({ where: { role: UserRole.SELLER } }),
      
      // Total products
      prisma.product.count(),
      
      // Total orders
      prisma.order.count(),
      
      // Total revenue
      prisma.order.aggregate({
        where: { status: { in: [OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] } },
        _sum: { total: true }
      }),
      
      // Monthly revenue (last 30 days)
      prisma.order.aggregate({
        where: {
          status: { in: [OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] },
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        _sum: { total: true }
      }),
      
      // Pending orders
      prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      
      // Active users (logged in last 30 days)
      prisma.user.count({
        where: { lastLogin: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      })
    ]);

    res.json({
      stats: {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        monthlyRevenue: monthlyRevenue._sum.total || 0,
        pendingOrders,
        activeUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all users with filters
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, search, isActive, page = 1, limit = 10 } = req.query;

    const where: any = {};

    if (role) {
      where.role = role as UserRole;
    }

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              products: true
            }
          }
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Update user status
export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Update user role
export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    // Create seller profile if changing to seller
    if (role === UserRole.SELLER) {
      await prisma.sellerProfile.upsert({
        where: { userId },
        create: {
          userId,
          businessName: user.name,
          description: ''
        },
        update: {}
      });
    }

    // Create admin profile if changing to admin
    if (role === UserRole.ADMIN) {
      await prisma.adminProfile.upsert({
        where: { userId },
        create: { userId },
        update: {}
      });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Get all products with filters
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, seller, isActive, page = 1, limit = 10 } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (seller) {
      where.sellerId = seller;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
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

// Update product status
export const updateProductStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const { isActive } = req.body;

    const product = await prisma.product.update({
      where: { id: productId },
      data: { isActive }
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Get all orders with filters
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, userId, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

    const where: any = {};

    if (status) {
      where.status = status as OrderStatus;
    }

    if (userId) {
      where.userId = userId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(String(dateFrom));
      }
      if (dateTo) {
        where.createdAt.lte = new Date(String(dateTo));
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  thumbnail: true
                }
              }
            }
          }
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Get platform analytics
export const getPlatformAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
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

    // Get revenue by day
    const revenueByDay = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as orders,
        SUM(total) as revenue
      FROM "Order"
      WHERE "createdAt" >= ${startDate}
        AND status IN ('DELIVERED', 'PROCESSING', 'SHIPPED')
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `;

    // Get user growth
    const userGrowth = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as new_users
      FROM "User"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `;

    // Get top categories
    const topCategories = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { in: [OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] }
        }
      },
      _count: { id: true },
      _sum: { total: true }
    });

    // Get category details
    const productIds = topCategories.map(tc => tc.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true }
    });

    const categoryRevenue = new Map<string, number>();
    topCategories.forEach(tc => {
      const product = products.find(p => p.id === tc.productId);
      if (product?.category) {
        const current = categoryRevenue.get(product.category.id) || 0;
        categoryRevenue.set(product.category.id, current + (tc._sum.total || 0));
      }
    });

    const topCategoriesData = Array.from(categoryRevenue.entries())
      .map(([categoryId, revenue]) => {
        const category = products.find(p => p.categoryId === categoryId)?.category;
        return { category, revenue };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      revenueByDay,
      userGrowth,
      topCategories: topCategoriesData
    });
  } catch (error) {
    next(error);
  }
};

// Manage categories
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description, icon, parentId } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        parentId
      }
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.params;
    const { name, slug, description, icon, parentId } = req.body;

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug,
        description,
        icon,
        parentId
      }
    });

    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.params;

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId }
    });

    if (productCount > 0) {
      throw new AppError('Cannot delete category with products', 400);
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// System settings
export const getSystemSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // This would typically fetch from a settings table
    // For now, return default settings
    res.json({
      commission: {
        defaultRate: 0.1,
        minRate: 0.05,
        maxRate: 0.3
      },
      shipping: {
        freeShippingThreshold: 50,
        defaultShippingCost: 5
      },
      payment: {
        supportedMethods: ['card', 'paypal', 'stripe'],
        currency: 'USD'
      },
      email: {
        fromAddress: 'noreply@shopfronts.com',
        supportEmail: 'support@shopfronts.com'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create admin user
export const createAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and admin profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.ADMIN,
        emailVerified: true,
        adminProfile: {
          create: {}
        }
      },
      include: {
        adminProfile: true
      }
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};