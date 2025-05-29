"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const performance_controller_1 = require("../controllers/performance.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// All performance routes require admin authentication
router.use(auth_1.authenticate);
// Get performance analysis
router.get('/analysis', performance_controller_1.PerformanceController.getAnalysis);
// Get performance report
router.get('/report', performance_controller_1.PerformanceController.getReport);
// Run auto-optimization
router.post('/optimize', performance_controller_1.PerformanceController.runOptimization);
// Benchmark endpoint
router.post('/benchmark', [
    (0, express_validator_1.body)('endpoint').isString().notEmpty(),
    (0, express_validator_1.body)('method').optional().isIn(['GET', 'POST', 'PUT', 'DELETE']),
], validation_1.validateRequest, performance_controller_1.PerformanceController.benchmarkEndpoint);
// Get slow queries
router.get('/slow-queries', [(0, express_validator_1.query)('threshold').optional().isInt({ min: 0 })], validation_1.validateRequest, performance_controller_1.PerformanceController.getSlowQueries);
// Detect memory leaks
router.get('/memory-leaks', performance_controller_1.PerformanceController.detectMemoryLeaks);
exports.default = router;
//# sourceMappingURL=performance.routes.js.map