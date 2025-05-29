"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const productController = __importStar(require("../controllers/product.controller"));
const cache_1 = require("../middleware/cache");
const router = (0, express_1.Router)();
// Public routes
// Get all products with filters
router.get('/', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('minPrice').optional().isFloat({ min: 0 }),
    (0, express_validator_1.query)('maxPrice').optional().isFloat({ min: 0 }),
    (0, express_validator_1.query)('sortBy').optional().isIn(['price', 'name', 'createdAt']),
    (0, express_validator_1.query)('order').optional().isIn(['asc', 'desc'])
], validate_1.validate, (0, cache_1.cache)(cache_1.cacheConfigs.productList), productController.getProducts);
// Search products
router.get('/search', [
    (0, express_validator_1.query)('q').notEmpty().withMessage('Search query is required'),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 })
], validate_1.validate, (0, cache_1.cache)(cache_1.cacheConfigs.searchResults), productController.searchProducts);
// Get products by category
router.get('/category/:categoryId', [
    (0, express_validator_1.param)('categoryId').isUUID(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 })
], validate_1.validate, productController.getProductsByCategory);
// Get single product
router.get('/:id', [(0, express_validator_1.param)('id').isUUID()], validate_1.validate, (0, cache_1.cache)(cache_1.cacheConfigs.productDetail), productController.getProductById);
// Protected routes (seller only)
// Create product
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('SELLER'), [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Product name is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('categoryId').isUUID().withMessage('Valid category ID is required'),
    (0, express_validator_1.body)('stock').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('images').optional().isArray(),
    (0, express_validator_1.body)('images.*.url').optional().isURL()
], validate_1.validate, (0, cache_1.clearCache)(['products']), productController.createProduct);
// Update product
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('SELLER'), [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('name').optional().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim().notEmpty(),
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('categoryId').optional().isUUID(),
    (0, express_validator_1.body)('stock').optional().isInt({ min: 0 })
], validate_1.validate, (0, cache_1.clearCache)((req) => ['products', `product:${req.params.id}`]), productController.updateProduct);
// Delete product
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('SELLER'), [(0, express_validator_1.param)('id').isUUID()], validate_1.validate, (0, cache_1.clearCache)((req) => ['products', `product:${req.params.id}`]), productController.deleteProduct);
exports.default = router;
//# sourceMappingURL=product.routes.js.map