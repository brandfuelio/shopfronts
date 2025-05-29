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
const auth_1 = require("../middleware/auth");
const validateRequest_1 = require("../middleware/validateRequest");
const adminController = __importStar(require("../controllers/admin.controller"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// All routes require admin authentication except createAdminUser
router.post('/create-admin', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('name').isString().trim().notEmpty(),
    validateRequest_1.validateRequest
], adminController.createAdminUser);
// Apply admin auth to all other routes
router.use(auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN));
// Dashboard
router.get('/dashboard', adminController.getDashboardStats);
// Users management
router.get('/users', [
    (0, express_validator_1.query)('role').optional().isIn(['CUSTOMER', 'SELLER', 'ADMIN']),
    (0, express_validator_1.query)('search').optional().isString(),
    (0, express_validator_1.query)('isActive').optional().isBoolean(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    validateRequest_1.validateRequest
], adminController.getUsers);
router.patch('/users/:userId/status', [
    (0, express_validator_1.param)('userId').isString(),
    (0, express_validator_1.body)('isActive').isBoolean(),
    validateRequest_1.validateRequest
], adminController.updateUserStatus);
router.patch('/users/:userId/role', [
    (0, express_validator_1.param)('userId').isString(),
    (0, express_validator_1.body)('role').isIn(['CUSTOMER', 'SELLER', 'ADMIN']),
    validateRequest_1.validateRequest
], adminController.updateUserRole);
// Products management
router.get('/products', [
    (0, express_validator_1.query)('search').optional().isString(),
    (0, express_validator_1.query)('category').optional().isString(),
    (0, express_validator_1.query)('seller').optional().isString(),
    (0, express_validator_1.query)('isActive').optional().isBoolean(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    validateRequest_1.validateRequest
], adminController.getProducts);
router.patch('/products/:productId/status', [
    (0, express_validator_1.param)('productId').isString(),
    (0, express_validator_1.body)('isActive').isBoolean(),
    validateRequest_1.validateRequest
], adminController.updateProductStatus);
// Orders management
router.get('/orders', [
    (0, express_validator_1.query)('status').optional().isString(),
    (0, express_validator_1.query)('userId').optional().isString(),
    (0, express_validator_1.query)('dateFrom').optional().isISO8601(),
    (0, express_validator_1.query)('dateTo').optional().isISO8601(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    validateRequest_1.validateRequest
], adminController.getOrders);
// Analytics
router.get('/analytics', [
    (0, express_validator_1.query)('period').optional().isIn(['7d', '30d', '90d', '1y']),
    validateRequest_1.validateRequest
], adminController.getPlatformAnalytics);
// Categories management
router.post('/categories', [
    (0, express_validator_1.body)('name').isString().trim().notEmpty(),
    (0, express_validator_1.body)('slug').isString().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('icon').optional().isString(),
    (0, express_validator_1.body)('parentId').optional().isString(),
    validateRequest_1.validateRequest
], adminController.createCategory);
router.put('/categories/:categoryId', [
    (0, express_validator_1.param)('categoryId').isString(),
    (0, express_validator_1.body)('name').optional().isString().trim().notEmpty(),
    (0, express_validator_1.body)('slug').optional().isString().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('icon').optional().isString(),
    (0, express_validator_1.body)('parentId').optional().isString(),
    validateRequest_1.validateRequest
], adminController.updateCategory);
router.delete('/categories/:categoryId', [
    (0, express_validator_1.param)('categoryId').isString(),
    validateRequest_1.validateRequest
], adminController.deleteCategory);
// System settings
router.get('/settings', adminController.getSystemSettings);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map