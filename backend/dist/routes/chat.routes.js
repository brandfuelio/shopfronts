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
const chatController = __importStar(require("../controllers/chat.controller"));
const router = (0, express_1.Router)();
// Protected routes (authenticated users)
// Get user's chat sessions
router.get('/sessions', auth_1.authenticate, [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], validate_1.validate, chatController.getChatSessions);
// Get specific chat session
router.get('/sessions/:sessionId', auth_1.authenticate, [(0, express_validator_1.param)('sessionId').isUUID()], validate_1.validate, chatController.getChatSession);
// Create new chat session
router.post('/sessions', auth_1.authenticate, [
    (0, express_validator_1.body)('title').optional().trim(),
    (0, express_validator_1.body)('context').optional().isObject()
], validate_1.validate, chatController.createChatSession);
// Send message in chat session
router.post('/sessions/:sessionId/messages', auth_1.authenticate, [
    (0, express_validator_1.param)('sessionId').isUUID(),
    (0, express_validator_1.body)('content').trim().notEmpty().withMessage('Message content is required'),
    (0, express_validator_1.body)('metadata').optional().isObject()
], validate_1.validate, chatController.sendMessage);
// Delete chat session
router.delete('/sessions/:sessionId', auth_1.authenticate, [(0, express_validator_1.param)('sessionId').isUUID()], validate_1.validate, chatController.deleteChatSession);
// AI recommendations (can be used without authentication)
router.post('/recommendations', auth_1.optionalAuth, [
    (0, express_validator_1.body)('query').trim().notEmpty().withMessage('Query is required'),
    (0, express_validator_1.body)('filters').optional().isObject()
], validate_1.validate, chatController.getAIRecommendations);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map