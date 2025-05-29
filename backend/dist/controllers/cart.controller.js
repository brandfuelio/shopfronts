"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
// Get user's cart
const getCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cartItems = await database_1.prisma.cartItem.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        images: true,
                        category: true,
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
        });
        // Calculate total
        const total = cartItems.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);
        const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        res.json({
            success: true,
            data: {
                items: cartItems,
                total,
                itemCount
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCart = getCart;
// Add item to cart
const addToCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;
        // Verify product exists and is active
        const product = await database_1.prisma.product.findUnique({
            where: { id: productId }
        });
        if (!product || !product.isActive) {
            throw new errorHandler_1.AppError('Product not found or unavailable', 404);
        }
        // Check stock
        if (product.stock < quantity) {
            throw new errorHandler_1.AppError('Insufficient stock available', 400);
        }
        // Check if item already in cart
        const existingItem = await database_1.prisma.cartItem.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });
        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;
            if (product.stock < newQuantity) {
                throw new errorHandler_1.AppError('Insufficient stock for requested quantity', 400);
            }
            await database_1.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity }
            });
        }
        else {
            // Add new item
            await database_1.prisma.cartItem.create({
                data: {
                    userId,
                    productId,
                    quantity
                }
            });
        }
        // Return updated cart
        const cartItems = await database_1.prisma.cartItem.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        images: true,
                        category: true
                    }
                }
            }
        });
        res.json({
            success: true,
            message: 'Item added to cart',
            data: { items: cartItems }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addToCart = addToCart;
// Update cart item quantity
const updateCartItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const { quantity } = req.body;
        // Get cart item
        const cartItem = await database_1.prisma.cartItem.findUnique({
            where: { id: itemId },
            include: {
                product: true
            }
        });
        if (!cartItem || cartItem.userId !== userId) {
            throw new errorHandler_1.AppError('Cart item not found', 404);
        }
        // Check stock
        if (cartItem.product.stock < quantity) {
            throw new errorHandler_1.AppError('Insufficient stock available', 400);
        }
        // Update quantity
        await database_1.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity }
        });
        res.json({
            success: true,
            message: 'Cart item updated'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCartItem = updateCartItem;
// Remove item from cart
const removeFromCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        // Get cart item
        const cartItem = await database_1.prisma.cartItem.findUnique({
            where: { id: itemId }
        });
        if (!cartItem || cartItem.userId !== userId) {
            throw new errorHandler_1.AppError('Cart item not found', 404);
        }
        // Delete item
        await database_1.prisma.cartItem.delete({
            where: { id: itemId }
        });
        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.removeFromCart = removeFromCart;
// Clear cart
const clearCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        // Delete all cart items for user
        await database_1.prisma.cartItem.deleteMany({
            where: { userId }
        });
        res.json({
            success: true,
            message: 'Cart cleared'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.clearCart = clearCart;
//# sourceMappingURL=cart.controller.js.map