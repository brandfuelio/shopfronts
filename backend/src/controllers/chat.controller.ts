import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

// Get user's chat sessions
export const getChatSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [sessions, total] = await Promise.all([
      prisma.chatSession.findMany({
        where: { userId },
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: { messages: true }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      }),
      prisma.chatSession.count({ where: { userId } })
    ]);

    res.json({
      success: true,
      data: {
        sessions: sessions.map((session: any) => ({
          ...session,
          messageCount: session._count.messages,
          lastMessage: session.messages[0] || null
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get chat session by ID with messages
export const getChatSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;

    const session = await prisma.chatSession.findUnique({
      where: { 
        id: sessionId,
        userId // Ensure user owns the session
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      throw new AppError('Chat session not found', 404);
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// Create new chat session
export const createChatSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, context } = req.body;

    const session = await prisma.chatSession.create({
      data: {
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title: title || 'New Chat',
        context: context || {}
      }
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// Send message in chat session
export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;
    const { content, metadata } = req.body;

    // Verify session exists and belongs to user
    const session = await prisma.chatSession.findUnique({
      where: { 
        id: sessionId,
        userId
      }
    });

    if (!session) {
      throw new AppError('Chat session not found', 404);
    }

    // Create user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'USER',
        content,
        metadata: metadata || {}
      }
    });

    // TODO: Process message with AI service
    // For now, create a mock AI response
    const aiResponse = await processAIResponse(content, session.context);

    // Create AI message
    const aiMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'ASSISTANT',
        content: aiResponse.content,
        metadata: aiResponse.metadata || {}
      }
    });

    // Update session
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        updatedAt: new Date(),
        context: {
          ...(session.context as object),
          lastQuery: content,
          lastResponse: aiResponse.content
        }
      }
    });

    res.json({
      success: true,
      data: {
        userMessage,
        aiMessage
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete chat session
export const deleteChatSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;

    const session = await prisma.chatSession.findUnique({
      where: { 
        id: sessionId,
        userId
      }
    });

    if (!session) {
      throw new AppError('Chat session not found', 404);
    }

    await prisma.chatSession.delete({
      where: { id: sessionId }
    });

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Mock AI response processor (to be replaced with actual AI service)
async function processAIResponse(userMessage: string, _context: Prisma.JsonValue): Promise<{
  content: string;
  metadata?: Record<string, any>;
}> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Basic keyword-based responses for demo
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion')) {
    return {
      content: "Based on your preferences, I'd recommend checking out our latest collection of electronics. We have some great deals on smartphones and laptops. Would you like me to show you specific categories?",
      metadata: {
        intent: 'product_recommendation',
        suggestedCategories: ['electronics', 'smartphones', 'laptops']
      }
    };
  }

  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return {
      content: "I can help you find products within your budget. What price range are you looking for? You can also use our filters to sort products by price.",
      metadata: {
        intent: 'price_inquiry'
      }
    };
  }

  if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
    return {
      content: "We offer free shipping on orders over $50. Standard delivery takes 3-5 business days, and express shipping (1-2 days) is available for an additional fee. Would you like to know more about our shipping policies?",
      metadata: {
        intent: 'shipping_info'
      }
    };
  }

  if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
    return {
      content: "We have a 30-day return policy for most items. Products must be in original condition with tags attached. Refunds are processed within 5-7 business days after we receive the returned item. Would you like me to help you start a return?",
      metadata: {
        intent: 'return_policy'
      }
    };
  }

  // Default response
  return {
    content: "I'm here to help you find the perfect products! You can ask me about product recommendations, pricing, shipping, returns, or anything else related to your shopping experience. What would you like to know?",
    metadata: {
      intent: 'general_help'
    }
  };
}

// Get AI product recommendations
export const getAIRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { query } = req.body;

    // TODO: Implement actual AI recommendation engine
    // For now, return mock recommendations based on query

    const recommendations = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 6,
      include: {
        category: true,
        images: true,
        seller: {
          select: {
            id: true,
            name: true,
            sellerProfile: {
              select: {
                businessName: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        query,
        recommendations,
        explanation: `Here are some products that match "${query}". I've selected these based on relevance and popularity.`
      }
    });
  } catch (error) {
    next(error);
  }
};