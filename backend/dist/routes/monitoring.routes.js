"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const monitoring_controller_1 = require("../controllers/monitoring.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Public health check endpoint
router.get('/health', monitoring_controller_1.MonitoringController.healthCheck);
// Prometheus metrics endpoint (could be protected in production)
router.get('/metrics', monitoring_controller_1.MonitoringController.getPrometheusMetrics);
// Protected monitoring endpoints (admin only)
router.use(auth_1.authenticate);
// System metrics
router.get('/system', monitoring_controller_1.MonitoringController.getMetrics);
// Performance statistics
router.get('/performance', [(0, express_validator_1.query)('hours').optional().isInt({ min: 1, max: 168 })], // Max 7 days
validation_1.validateRequest, monitoring_controller_1.MonitoringController.getPerformanceStats);
// Error logs
router.get('/errors', [(0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 1000 })], validation_1.validateRequest, monitoring_controller_1.MonitoringController.getErrorLogs);
// Create test alert
router.post('/alerts/test', [
    (0, express_validator_1.body)('type').optional().isString(),
    (0, express_validator_1.body)('message').optional().isString(),
    (0, express_validator_1.body)('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
], validation_1.validateRequest, monitoring_controller_1.MonitoringController.createTestAlert);
exports.default = router;
//# sourceMappingURL=monitoring.routes.js.map