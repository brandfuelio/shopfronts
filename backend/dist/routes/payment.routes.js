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
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const paymentController = __importStar(require("../controllers/payment.controller"));
const router = (0, express_1.Router)();
// Get payment configuration (public)
router.get('/config', paymentController.getPaymentConfig);
// Stripe webhook (no auth, but verified by signature)
router.post('/webhook', 
// Note: This needs raw body, not JSON parsed
paymentController.handleWebhook);
// Protected routes
router.use(auth_1.authenticate);
// Create payment intent
router.post('/intent', [
    (0, express_validator_1.body)('orderId').notEmpty().isUUID(),
    (0, express_validator_1.body)('amount').isFloat({ min: 0.01 }),
    (0, express_validator_1.body)('currency').optional().isString().isLength({ min: 3, max: 3 }),
    (0, express_validator_1.body)('metadata').optional().isObject(),
], validation_1.validateRequest, paymentController.createPaymentIntent);
// Create checkout session
router.post('/checkout', [
    (0, express_validator_1.body)('orderId').notEmpty().isUUID(),
    (0, express_validator_1.body)('items').isArray().notEmpty(),
    (0, express_validator_1.body)('items.*.productId').isUUID(),
    (0, express_validator_1.body)('items.*.quantity').isInt({ min: 1 }),
    (0, express_validator_1.body)('items.*.price').isFloat({ min: 0.01 }),
    (0, express_validator_1.body)('successUrl').optional().isURL(),
    (0, express_validator_1.body)('cancelUrl').optional().isURL(),
], validation_1.validateRequest, paymentController.createCheckoutSession);
// Get payment details
router.get('/intent/:paymentIntentId', [(0, express_validator_1.param)('paymentIntentId').notEmpty().isString()], validation_1.validateRequest, paymentController.getPaymentDetails);
// Admin routes
router.use((0, auth_1.authorize)(['ADMIN']));
// Refund payment
router.post('/refund/:orderId', [
    (0, express_validator_1.param)('orderId').isUUID(),
    (0, express_validator_1.body)('amount').optional().isFloat({ min: 0.01 }),
    (0, express_validator_1.body)('reason').optional().isIn(['duplicate', 'fraudulent', 'requested_by_customer']),
], validation_1.validateRequest, paymentController.refundPayment);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map