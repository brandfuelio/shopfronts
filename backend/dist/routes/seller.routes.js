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
const sellerController = __importStar(require("../controllers/seller.controller"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// All routes require seller authentication
router.use(auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.SELLER));
// Dashboard stats
router.get('/dashboard', sellerController.getDashboardStats);
// Orders
router.get('/orders', [
    (0, express_validator_1.query)('status').optional().isString(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    validateRequest_1.validateRequest
], sellerController.getSellerOrders);
// Products
router.get('/products', [
    (0, express_validator_1.query)('search').optional().isString(),
    (0, express_validator_1.query)('category').optional().isString(),
    (0, express_validator_1.query)('status').optional().isIn(['active', 'inactive']),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    validateRequest_1.validateRequest
], sellerController.getSellerProducts);
// Profile
router.put('/profile', [
    (0, express_validator_1.body)('businessName').optional().isString().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('website').optional().isURL(),
    (0, express_validator_1.body)('payoutDetails').optional().isObject(),
    validateRequest_1.validateRequest
], sellerController.updateSellerProfile);
// Analytics
router.get('/analytics', [
    (0, express_validator_1.query)('period').optional().isIn(['7d', '30d', '90d', '1y']),
    validateRequest_1.validateRequest
], sellerController.getSellerAnalytics);
// Payouts
router.get('/payouts', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    validateRequest_1.validateRequest
], sellerController.getPayoutHistory);
exports.default = router;
//# sourceMappingURL=seller.routes.js.map