"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cache_controller_1 = require("../controllers/cache.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// All cache routes require admin authentication
router.use(auth_1.authenticate);
// Get cache statistics
router.get('/stats', cache_controller_1.CacheController.getStats);
// Clear cache
router.post('/clear', [
    (0, express_validator_1.body)('tag').optional().isString(),
    (0, express_validator_1.body)('pattern').optional().isString(),
    (0, express_validator_1.body)('all').optional().isBoolean(),
], validation_1.validateRequest, cache_controller_1.CacheController.clearCache);
// Warm cache
router.post('/warm', cache_controller_1.CacheController.warmCache);
// Get specific cache entry
router.get('/entries/:key', [(0, express_validator_1.param)('key').isString()], validation_1.validateRequest, cache_controller_1.CacheController.getCacheEntry);
// Delete specific cache entry
router.delete('/entries/:key', [(0, express_validator_1.param)('key').isString()], validation_1.validateRequest, cache_controller_1.CacheController.deleteCacheEntry);
exports.default = router;
//# sourceMappingURL=cache.routes.js.map