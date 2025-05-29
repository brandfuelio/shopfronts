import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as cartController from '../controllers/cart.controller';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

// Get user's cart
router.get('/', cartController.getCart);

// Add item to cart
router.post(
  '/items',
  [
    body('productId').isUUID().withMessage('Valid product ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  validate,
  cartController.addToCart
);

// Update cart item quantity
router.put(
  '/items/:itemId',
  [
    param('itemId').isUUID(),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  validate,
  cartController.updateCartItem
);

// Remove item from cart
router.delete(
  '/items/:itemId',
  [param('itemId').isUUID()],
  validate,
  cartController.removeFromCart
);

// Clear cart
router.delete('/', cartController.clearCart);

export default router;
