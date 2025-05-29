"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminUser = exports.getSystemSettings = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getPlatformAnalytics = exports.getOrders = exports.updateProductStatus = exports.getProducts = exports.updateUserRole = exports.updateUserStatus = exports.getUsers = exports.getDashboardStats = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Get admin dashboard stats
const getDashboardStats = async (_req, res, next) => {
    try {
        const [totalUsers, totalSellers, totalProducts, totalOrders, totalRevenue, monthlyRevenue, pendingOrders, activeUsers] = await Promise.all([
            // Total users
            database_1.prisma.user.count(),
            // Total sellers
            database_1.prisma.user.count({ where: { role: client_1.UserRole.SELLER } }),
            // Total products
            database_1.prisma.product.count(),
            // Total orders
            database_1.prisma.order.count(),
            // Total revenue
            database_1.prisma.order.aggregate({
                where: { status: { in: [client_1.OrderStatus.DELIVERED, client_1.OrderStatus.PROCESSING, client_1.OrderStatus.SHIPPED] } },
                _sum: { total: true }
            }),
            // Monthly revenue (last 30 days)
            database_1.prisma.order.aggregate({
                where: {
                    status: { in: [client_1.OrderStatus.DELIVERED, client_1.OrderStatus.PROCESSING, client_1.OrderStatus.SHIPPED] },
                    createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                },
                _sum: { total: true }
            }),
            // Pending orders
            database_1.prisma.order.count({ where: { status: client_1.OrderStatus.PENDING } }),
            // Active users (logged in last 30 days)
            database_1.prisma.user.count({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
// Get all users with filters
const getUsers = async (req, res, next) => {
    try {
        const { role, search, isActive, page = 1, limit = 10 } = req.query;
        const where = {};
        if (role) {
            where.role = role;
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
            database_1.prisma.user.findMany({
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
            database_1.prisma.user.count({ where })
        ]);
        res.json({
            users,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
// Update user status
const updateUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;
        const user = await database_1.prisma.user.update({
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserStatus = updateUserStatus;
// Update user role
const updateUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        // Validate role
        if (!Object.values(client_1.UserRole).includes(role)) {
            throw new errorHandler_1.AppError('Invalid role', 400);
        }
        const user = await database_1.prisma.user.update({
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
        if (role === client_1.UserRole.SELLER) {
            await database_1.prisma.sellerProfile.upsert({
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
        if (role === client_1.UserRole.ADMIN) {
            await database_1.prisma.adminProfile.upsert({
                where: { userId },
                create: { userId },
                update: {}
            });
        }
        res.json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserRole = updateUserRole;
// Get all products with filters
const getProducts = async (req, res, next) => {
    try {
        const { search, category, seller, isActive, page = 1, limit = 10 } = req.query;
        const where = {};
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
            database_1.prisma.product.findMany({
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
            database_1.prisma.product.count({ where })
        ]);
        res.json({
            products,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
// Update product status
const updateProductStatus = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { isActive } = req.body;
        const product = await database_1.prisma.product.update({
            where: { id: productId },
            data: { isActive }
        });
        res.json(product);
    }
    catch (error) {
        next(error);
    }
};
exports.updateProductStatus = updateProductStatus;
// Get all orders with filters
const getOrders = async (req, res, next) => {
    try {
        const { status, userId, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
        const where = {};
        if (status) {
            where.status = status;
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
            database_1.prisma.order.findMany({
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
            database_1.prisma.order.count({ where })
        ]);
        res.json({
            orders,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrders = getOrders;
// Get platform analytics
const getPlatformAnalytics = async (req, res, next) => {
    try {
        const { period = '30d' } = req.query;
        // Calculate date range
        let startDate;
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
        const revenueByDay = await database_1.prisma.$queryRaw `
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
        const userGrowth = await database_1.prisma.$queryRaw `
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as new_users
      FROM "User"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `;
        // Get top categories
        const topCategories = await database_1.prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
                order: {
                    createdAt: { gte: startDate },
                    status: { in: [client_1.OrderStatus.DELIVERED, client_1.OrderStatus.PROCESSING, client_1.OrderStatus.SHIPPED] }
                }
            },
            _count: { id: true },
            _sum: { total: true }
        });
        // Get category details
        const productIds = topCategories.map(tc => tc.productId);
        const products = await database_1.prisma.product.findMany({
            where: { id: { in: productIds } },
            include: { category: true }
        });
        const categoryRevenue = new Map();
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
    }
    catch (error) {
        next(error);
    }
};
exports.getPlatformAnalytics = getPlatformAnalytics;
// Manage categories
const createCategory = async (req, res, next) => {
    try {
        const { name, slug, description, icon, parentId } = req.body;
        const category = await database_1.prisma.category.create({
            data: {
                name,
                slug,
                description,
                icon,
                parentId
            }
        });
        res.status(201).json(category);
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const { name, slug, description, icon, parentId } = req.body;
        const category = await database_1.prisma.category.update({
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        // Check if category has products
        const productCount = await database_1.prisma.product.count({
            where: { categoryId }
        });
        if (productCount > 0) {
            throw new errorHandler_1.AppError('Cannot delete category with products', 400);
        }
        await database_1.prisma.category.delete({
            where: { id: categoryId }
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
// System settings
const getSystemSettings = async (_req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.getSystemSettings = getSystemSettings;
// Create admin user
const createAdminUser = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        // Check if user exists
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            throw new errorHandler_1.AppError('User already exists', 400);
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user and admin profile
        const user = await database_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: client_1.UserRole.ADMIN,
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
    }
    catch (error) {
        next(error);
    }
};
exports.createAdminUser = createAdminUser;
//# sourceMappingURL=admin.controller.js.map