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
const validate_1 = require("../middleware/validate");
const orderController = __importStar(require("../controllers/order.controller"));
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Customer routes
router.post('/', [
    (0, express_validator_1.body)('shippingAddress').isObject().withMessage('Shipping address is required'),
    (0, express_validator_1.body)('shippingAddress.street').notEmpty().withMessage('Street is required'),
    (0, express_validator_1.body)('shippingAddress.city').notEmpty().withMessage('City is required'),
    (0, express_validator_1.body)('shippingAddress.state').notEmpty().withMessage('State is required'),
    (0, express_validator_1.body)('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
    (0, express_validator_1.body)('shippingAddress.country').notEmpty().withMessage('Country is required'),
    (0, express_validator_1.body)('paymentMethod').notEmpty().withMessage('Payment method is required'),
    (0, express_validator_1.body)('notes').optional().isString(),
    validate_1.validate
], orderController.createOrder);
router.get('/my-orders', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('status').optional().isIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    validate_1.validate
], orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', [
    (0, express_validator_1.body)('reason').optional().isString(),
    validate_1.validate
], orderController.cancelOrder);
// Seller routes
router.get('/seller/orders', (0, auth_1.authorize)('SELLER'), [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('status').optional().isIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    validate_1.validate
], orderController.getSellerOrders);
// Admin routes
router.get('/', (0, auth_1.authorize)('ADMIN'), [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('status').optional().isIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    (0, express_validator_1.query)('search').optional().isString(),
    validate_1.validate
], orderController.getAllOrders);
router.put('/:id/status', (0, auth_1.authorize)('ADMIN', 'SELLER'), [
    (0, express_validator_1.body)('status').isIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    validate_1.validate
], orderController.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=order.routes.js.map