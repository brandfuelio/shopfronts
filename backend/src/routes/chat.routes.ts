import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, optionalAuth } from '../middleware/auth';
import * as chatController from '../controllers/chat.controller';

const router = Router();

// Protected routes (authenticated users)
// Get user's chat sessions
router.get(
  '/sessions',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  validate,
  chatController.getChatSessions
);

// Get specific chat session
router.get(
  '/sessions/:sessionId',
  authenticate,
  [param('sessionId').isUUID()],
  validate,
  chatController.getChatSession
);

// Create new chat session
router.post(
  '/sessions',
  authenticate,
  [
    body('title').optional().trim(),
    body('context').optional().isObject()
  ],
  validate,
  chatController.createChatSession
);

// Send message in chat session
router.post(
  '/sessions/:sessionId/messages',
  authenticate,
  [
    param('sessionId').isUUID(),
    body('content').trim().notEmpty().withMessage('Message content is required'),
    body('metadata').optional().isObject()
  ],
  validate,
  chatController.sendMessage
);

// Delete chat session
router.delete(
  '/sessions/:sessionId',
  authenticate,
  [param('sessionId').isUUID()],
  validate,
  chatController.deleteChatSession
);

// AI recommendations (can be used without authentication)
router.post(
  '/recommendations',
  optionalAuth,
  [
    body('query').trim().notEmpty().withMessage('Query is required'),
    body('filters').optional().isObject()
  ],
  validate,
  chatController.getAIRecommendations
);

export default router;
