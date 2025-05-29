import { Router, Request } from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as productController from '../controllers/product.controller';
import { cache, clearCache, cacheConfigs } from '../middleware/cache';

const router = Router();

// Public routes
// Get all products with filters
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('sortBy').optional().isIn(['price', 'name', 'createdAt']),
    query('order').optional().isIn(['asc', 'desc'])
  ],
  validate,
  cache(cacheConfigs.productList),
  productController.getProducts
);

// Search products
router.get(
  '/search',
  [
    query('q').notEmpty().withMessage('Search query is required'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  cache(cacheConfigs.searchResults),
  productController.searchProducts
);

// Get products by category
router.get(
  '/category/:categoryId',
  [
    param('categoryId').isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  productController.getProductsByCategory
);

// Get single product
router.get(
  '/:id',
  [param('id').isUUID()],
  validate,
  cache(cacheConfigs.productDetail),
  productController.getProductById
);

// Protected routes (seller only)
// Create product
router.post(
  '/',
  authenticate,
  authorize('SELLER'),
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('categoryId').isUUID().withMessage('Valid category ID is required'),
    body('stock').optional().isInt({ min: 0 }),
    body('images').optional().isArray(),
    body('images.*.url').optional().isURL()
  ],
  validate,
  clearCache(['products']),
  productController.createProduct
);

// Update product
router.put(
  '/:id',
  authenticate,
  authorize('SELLER'),
  [
    param('id').isUUID(),
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('categoryId').optional().isUUID(),
    body('stock').optional().isInt({ min: 0 })
  ],
  validate,
  clearCache((req) => ['products', `product:${req.params.id}`]),
  productController.updateProduct
);

// Delete product
router.delete(
  '/:id',
  authenticate,
  authorize('SELLER'),
  [param('id').isUUID()],
  validate,
  clearCache((req) => ['products', `product:${req.params.id}`]),
  productController.deleteProduct
);

export default router;
