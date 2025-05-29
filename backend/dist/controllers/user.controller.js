"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.deleteAccount = exports.updateUserStatus = exports.getAllUsers = exports.getUserById = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
// Get current user profile
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
                sellerProfile: true,
                adminProfile: true
            }
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
// Update user profile
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, avatar } = req.body;
        const user = await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(avatar && { avatar })
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
// Change password
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        // Get user with password
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        // Verify current password
        const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new errorHandler_1.AppError('Current password is incorrect', 401);
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update password
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
// Get user by ID (admin only)
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await database_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                sellerProfile: true,
                adminProfile: true,
                _count: {
                    select: {
                        orders: true,
                        products: true,
                        reviews: true
                    }
                }
            }
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
// Get all users (admin only)
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, role, search, isActive } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (role) {
            where.role = role;
        }
        if (typeof isActive === 'string') {
            where.isActive = isActive === 'true';
        }
        if (search) {
            where.OR = [
                { name: { contains: String(search), mode: 'insensitive' } },
                { email: { contains: String(search), mode: 'insensitive' } }
            ];
        }
        const [users, total] = await Promise.all([
            database_1.prisma.user.findMany({
                where,
                skip,
                take: Number(limit),
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    avatar: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            orders: true,
                            products: true,
                            reviews: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            database_1.prisma.user.count({ where })
        ]);
        res.json({
            success: true,
            data: users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
// Update user status (admin only)
const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const user = await database_1.prisma.user.update({
            where: { id },
            data: { isActive },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true
            }
        });
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserStatus = updateUserStatus;
// Delete user account
const deleteAccount = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;
        // Get user with password
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new errorHandler_1.AppError('Password is incorrect', 401);
        }
        // Delete user (cascade will handle related records)
        await database_1.prisma.user.delete({
            where: { id: userId }
        });
        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAccount = deleteAccount;
// Get user statistics (for dashboard)
const getUserStats = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        let stats = {
            totalOrders: 0,
            totalSpent: 0,
            activeCart: 0
        };
        if (user.role === 'CUSTOMER') {
            const [orderStats, cartCount] = await Promise.all([
                database_1.prisma.order.aggregate({
                    where: { userId },
                    _count: true,
                    _sum: { total: true }
                }),
                database_1.prisma.cartItem.count({
                    where: { userId }
                })
            ]);
            stats = {
                totalOrders: orderStats._count,
                totalSpent: orderStats._sum.total || 0,
                activeCart: cartCount
            };
        }
        else if (user.role === 'SELLER') {
            const [productCount, orderStats, reviewStats] = await Promise.all([
                database_1.prisma.product.count({
                    where: { sellerId: userId }
                }),
                database_1.prisma.orderItem.aggregate({
                    where: { product: { sellerId: userId } },
                    _count: true,
                    _sum: { total: true }
                }),
                database_1.prisma.review.aggregate({
                    where: { product: { sellerId: userId } },
                    _avg: { rating: true },
                    _count: true
                })
            ]);
            stats = {
                totalProducts: productCount,
                totalOrders: orderStats._count,
                totalRevenue: orderStats._sum.total || 0,
                averageRating: reviewStats._avg.rating || 0,
                totalReviews: reviewStats._count
            };
        }
        else if (user.role === 'ADMIN') {
            const [userCount, productCount, orderCount, revenue] = await Promise.all([
                database_1.prisma.user.count(),
                database_1.prisma.product.count(),
                database_1.prisma.order.count(),
                database_1.prisma.order.aggregate({
                    _sum: { total: true }
                })
            ]);
            stats = {
                totalUsers: userCount,
                totalProducts: productCount,
                totalOrders: orderCount,
                totalRevenue: revenue._sum.total || 0
            };
        }
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserStats = getUserStats;
//# sourceMappingURL=user.controller.js.map