import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Get user's cart
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const cartItems = await prisma.cartItem.findMany({
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
    const total = cartItems.reduce((sum: number, item: any) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const itemCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        items: cartItems,
        total,
        itemCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { productId, quantity = 1 } = req.body;

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || !product.isActive) {
      throw new AppError('Product not found or unavailable', 404);
    }

    // Check stock
    if (product.stock < quantity) {
      throw new AppError('Insufficient stock available', 400);
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
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
        throw new AppError('Insufficient stock for requested quantity', 400);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity
        }
      });
    }

    // Return updated cart
    const cartItems = await prisma.cartItem.findMany({
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
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Get cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: true
      }
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new AppError('Cart item not found', 404);
    }

    // Check stock
    if (cartItem.product.stock < quantity) {
      throw new AppError('Insufficient stock available', 400);
    }

    // Update quantity
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });

    res.json({
      success: true,
      message: 'Cart item updated'
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;

    // Get cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId }
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new AppError('Cart item not found', 404);
    }

    // Delete item
    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    // Delete all cart items for user
    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    next(error);
  }
};