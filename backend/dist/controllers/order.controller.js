"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.getAllOrders = exports.getSellerOrders = exports.updateOrderStatus = exports.getOrderById = exports.getUserOrders = exports.createOrder = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const client_1 = require("@prisma/client");
// Create order from cart
const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { shippingAddress, paymentMethod, notes } = req.body;
        // Get user's cart items
        const cartItems = await database_1.prisma.cartItem.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        seller: true
                    }
                }
            }
        });
        if (cartItems.length === 0) {
            throw new errorHandler_1.AppError('Cart is empty', 400);
        }
        // Calculate totals
        let subtotal = 0;
        const orderItems = cartItems.map(item => {
            const itemTotal = item.product.price * item.quantity;
            subtotal += itemTotal;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
                total: itemTotal
            };
        });
        const tax = subtotal * 0.1; // 10% tax
        const shipping = 10; // Fixed shipping cost
        const total = subtotal + tax + shipping;
        // Create order with items
        const order = await database_1.prisma.order.create({
            data: {
                userId,
                orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                status: client_1.OrderStatus.PENDING,
                subtotal,
                tax,
                shipping,
                total,
                shippingAddress,
                paymentMethod,
                notes,
                items: {
                    create: orderItems
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        // Clear cart
        await database_1.prisma.cartItem.deleteMany({
            where: { userId }
        });
        // Update product stock
        for (const item of cartItems) {
            await database_1.prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity
                    }
                }
            });
        }
        res.status(201).json({
            success: true,
            data: order
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
// Get user's orders
const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = { userId };
        if (status) {
            where.status = status;
        }
        const [orders, total] = await Promise.all([
            database_1.prisma.order.findMany({
                where,
                skip,
                take: Number(limit),
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    images: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            database_1.prisma.order.count({ where })
        ]);
        res.json({
            success: true,
            data: orders,
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
exports.getUserOrders = getUserOrders;
// Get order by ID
const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const order = await database_1.prisma.order.findUnique({
            where: { id },
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
                            include: {
                                images: true,
                                seller: {
                                    select: {
                                        id: true,
                                        name: true,
                                        sellerProfile: {
                                            select: {
                                                businessName: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!order) {
            throw new errorHandler_1.AppError('Order not found', 404);
        }
        // Check authorization
        if (userRole !== 'ADMIN' && order.userId !== userId) {
            // Check if user is a seller for any item in this order
            const isSeller = order.items.some(item => item.product.seller.id === userId);
            if (!isSeller) {
                throw new errorHandler_1.AppError('Not authorized to view this order', 403);
            }
        }
        res.json({
            success: true,
            data: order
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
// Update order status
const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;
        const order = await database_1.prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        if (!order) {
            throw new errorHandler_1.AppError('Order not found', 404);
        }
        // Check authorization
        if (userRole !== 'ADMIN') {
            // Check if user is a seller for any item in this order
            const isSeller = order.items.some(item => item.product.sellerId === userId);
            if (!isSeller) {
                throw new errorHandler_1.AppError('Not authorized to update this order', 403);
            }
        }
        // Validate status transition
        const validTransitions = {
            [client_1.OrderStatus.PENDING]: [client_1.OrderStatus.PROCESSING, client_1.OrderStatus.CANCELLED],
            [client_1.OrderStatus.PROCESSING]: [client_1.OrderStatus.SHIPPED, client_1.OrderStatus.CANCELLED],
            [client_1.OrderStatus.SHIPPED]: [client_1.OrderStatus.DELIVERED],
            [client_1.OrderStatus.DELIVERED]: [client_1.OrderStatus.REFUNDED],
            [client_1.OrderStatus.CANCELLED]: [],
            [client_1.OrderStatus.REFUNDED]: []
        };
        if (!validTransitions[order.status].includes(status)) {
            throw new errorHandler_1.AppError(`Cannot change status from ${order.status} to ${status}`, 400);
        }
        // Update order status
        const updatedOrder = await database_1.prisma.order.update({
            where: { id },
            data: {
                status,
                ...(status === client_1.OrderStatus.SHIPPED && { shippedAt: new Date() }),
                ...(status === client_1.OrderStatus.DELIVERED && { deliveredAt: new Date() })
            }
        });
        // If cancelled, restore product stock
        if (status === client_1.OrderStatus.CANCELLED) {
            for (const item of order.items) {
                await database_1.prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity
                        }
                    }
                });
            }
        }
        res.json({
            success: true,
            data: updatedOrder
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrderStatus = updateOrderStatus;
// Get seller orders
const getSellerOrders = async (req, res, next) => {
    try {
        const sellerId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Get orders that contain products from this seller
        const where = {
            items: {
                some: {
                    product: {
                        sellerId
                    }
                }
            }
        };
        if (status) {
            where.status = status;
        }
        const [orders, total] = await Promise.all([
            database_1.prisma.order.findMany({
                where,
                skip,
                take: Number(limit),
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    items: {
                        where: {
                            product: {
                                sellerId
                            }
                        },
                        include: {
                            product: {
                                include: {
                                    images: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            database_1.prisma.order.count({ where })
        ]);
        // Calculate seller-specific totals
        const ordersWithSellerTotals = orders.map(order => {
            const sellerItems = order.items;
            const sellerSubtotal = sellerItems.reduce((sum, item) => sum + item.total, 0);
            return {
                ...order,
                sellerSubtotal,
                sellerItemsCount: sellerItems.length
            };
        });
        res.json({
            success: true,
            data: ordersWithSellerTotals,
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
exports.getSellerOrders = getSellerOrders;
// Get all orders (admin only)
const getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { orderNumber: { contains: String(search), mode: 'insensitive' } },
                { user: { name: { contains: String(search), mode: 'insensitive' } } },
                { user: { email: { contains: String(search), mode: 'insensitive' } } }
            ];
        }
        const [orders, total] = await Promise.all([
            database_1.prisma.order.findMany({
                where,
                skip,
                take: Number(limit),
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
                                include: {
                                    seller: {
                                        select: {
                                            id: true,
                                            name: true,
                                            sellerProfile: {
                                                select: {
                                                    businessName: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            database_1.prisma.order.count({ where })
        ]);
        res.json({
            success: true,
            data: orders,
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
exports.getAllOrders = getAllOrders;
// Cancel order
const cancelOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { reason } = req.body;
        const order = await database_1.prisma.order.findUnique({
            where: { id },
            include: {
                items: true
            }
        });
        if (!order) {
            throw new errorHandler_1.AppError('Order not found', 404);
        }
        // Check authorization
        if (order.userId !== userId) {
            throw new errorHandler_1.AppError('Not authorized to cancel this order', 403);
        }
        // Check if order can be cancelled
        if (order.status !== client_1.OrderStatus.PENDING && order.status !== client_1.OrderStatus.PROCESSING) {
            throw new errorHandler_1.AppError('Order cannot be cancelled at this stage', 400);
        }
        // Update order status
        const updatedOrder = await database_1.prisma.order.update({
            where: { id },
            data: {
                status: client_1.OrderStatus.CANCELLED,
                notes: reason ? `Cancelled: ${reason}` : 'Cancelled by customer'
            }
        });
        // Restore product stock
        for (const item of order.items) {
            await database_1.prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        increment: item.quantity
                    }
                }
            });
        }
        res.json({
            success: true,
            data: updatedOrder
        });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelOrder = cancelOrder;
//# sourceMappingURL=order.controller.js.map