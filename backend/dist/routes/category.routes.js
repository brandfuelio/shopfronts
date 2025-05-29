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
const categoryController = __importStar(require("../controllers/category.controller"));
const router = (0, express_1.Router)();
// Public routes
// Get all categories
router.get('/', categoryController.getCategories);
// Get category by ID
router.get('/:id', [(0, express_validator_1.param)('id').isUUID()], validate_1.validate, categoryController.getCategoryById);
// Protected routes (admin only)
// Create category
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Category name is required'),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('image').optional().isURL()
], validate_1.validate, categoryController.createCategory);
// Update category
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('name').optional().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('image').optional().isURL()
], validate_1.validate, categoryController.updateCategory);
// Delete category
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), [(0, express_validator_1.param)('id').isUUID()], validate_1.validate, categoryController.deleteCategory);
exports.default = router;
//# sourceMappingURL=category.routes.js.map