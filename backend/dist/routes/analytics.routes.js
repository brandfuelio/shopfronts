"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Public tracking endpoints (no auth required)
router.post('/track/event', [
    (0, express_validator_1.body)('event').isString().notEmpty(),
    (0, express_validator_1.body)('category').isString().notEmpty(),
    (0, express_validator_1.body)('properties').optional().isObject(),
], validation_1.validateRequest, analytics_controller_1.AnalyticsController.trackEvent);
router.post('/track/product/:productId', [
    (0, express_validator_1.param)('productId').isString(),
    (0, express_validator_1.body)('referrer').optional().isString(),
    (0, express_validator_1.body)('duration').optional().isNumeric(),
], validation_1.validateRequest, analytics_controller_1.AnalyticsController.trackProductView);
router.post('/track/search', [
    (0, express_validator_1.body)('query').isString().notEmpty(),
    (0, express_validator_1.body)('resultsCount').isInt({ min: 0 }),
    (0, express_validator_1.body)('clickedResults').optional().isArray(),
], validation_1.validateRequest, analytics_controller_1.AnalyticsController.trackSearch);
// Protected analytics endpoints
router.use(auth_1.authenticate);
// Dashboard analytics (sellers and admins)
router.get('/dashboard', analytics_controller_1.AnalyticsController.getDashboardAnalytics);
// Product analytics (sellers and admins)
router.get('/products/:productId', [(0, express_validator_1.param)('productId').isString()], validation_1.validateRequest, analytics_controller_1.AnalyticsController.getProductAnalytics);
// Search analytics (admin only)
router.get('/search', analytics_controller_1.AnalyticsController.getSearchAnalytics);
// User analytics
router.get('/users/:userId', [(0, express_validator_1.param)('userId').isString()], validation_1.validateRequest, analytics_controller_1.AnalyticsController.getUserAnalytics);
// Export analytics (admin only)
router.get('/export', [
    (0, express_validator_1.query)('startDate').optional().isISO8601(),
    (0, express_validator_1.query)('endDate').optional().isISO8601(),
    (0, express_validator_1.query)('type').optional().isIn(['csv', 'json', 'excel']),
], validation_1.validateRequest, analytics_controller_1.AnalyticsController.exportAnalytics);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map