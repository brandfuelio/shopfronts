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
const reviewController = __importStar(require("../controllers/review.controller"));
const router = (0, express_1.Router)();
// Public routes
router.get('/product/:productId', [
    (0, express_validator_1.param)('productId').isString().notEmpty(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('sort').optional().isIn(['recent', 'rating-high', 'rating-low', 'helpful']),
    validate_1.validate
], reviewController.getProductReviews);
router.get('/:id', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    validate_1.validate
], reviewController.getReviewById);
// Protected routes
router.use(auth_1.authenticate);
// Create review
router.post('/', [
    (0, express_validator_1.body)('productId').isString().notEmpty(),
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('comment').isString().trim().notEmpty().withMessage('Comment is required'),
    validate_1.validate
], reviewController.createReview);
// Get user's reviews
router.get('/user/my-reviews', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    validate_1.validate
], reviewController.getUserReviews);
// Update review
router.put('/:id', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('comment').isString().trim().notEmpty().withMessage('Comment is required'),
    validate_1.validate
], reviewController.updateReview);
// Delete review
router.delete('/:id', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    validate_1.validate
], reviewController.deleteReview);
// Mark review as helpful
router.post('/:id/helpful', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    validate_1.validate
], reviewController.markReviewHelpful);
exports.default = router;
//# sourceMappingURL=review.routes.js.map