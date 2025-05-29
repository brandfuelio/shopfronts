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
const userController = __importStar(require("../controllers/user.controller"));
const router = (0, express_1.Router)();
// Protected routes (require authentication)
router.use(auth_1.authenticate);
// Get current user profile
router.get('/profile', userController.getProfile);
// Update current user profile
router.put('/profile', [
    (0, express_validator_1.body)('name').optional().isString().trim().notEmpty(),
    (0, express_validator_1.body)('avatar').optional().isURL(),
    validate_1.validate
], userController.updateProfile);
// Change password
router.put('/change-password', [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate_1.validate
], userController.changePassword);
// Get user statistics
router.get('/stats', userController.getUserStats);
// Delete account
router.delete('/account', [
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
    validate_1.validate
], userController.deleteAccount);
// Admin only routes
router.get('/', (0, auth_1.authorize)('ADMIN'), userController.getAllUsers);
router.get('/:id', (0, auth_1.authorize)('ADMIN'), userController.getUserById);
router.put('/:id/status', (0, auth_1.authorize)('ADMIN'), [
    (0, express_validator_1.body)('isActive').isBoolean(),
    validate_1.validate
], userController.updateUserStatus);
exports.default = router;
//# sourceMappingURL=user.routes.js.map