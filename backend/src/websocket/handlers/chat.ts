import { Socket, Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';
import { processAIMessage } from '../../services/ai.service';

const prisma = new PrismaClient();

interface ChatMessage {
  sessionId: string;
  content: string;
  attachments?: string[];
}

interface TypingEvent {
  sessionId: string;
  isTyping: boolean;
}

export const chatHandlers = (socket: Socket, io: Server) => {
  // Join chat session
  socket.on('chat:join', async (sessionId: string) => {
    try {
      const session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: socket.data.userId,
        },
      });

      if (!session) {
        socket.emit('chat:error', { message: 'Session not found' });
        return;
      }

      socket.join(`chat:${sessionId}`);
      socket.emit('chat:joined', { sessionId });
      logger.debug(`User ${socket.data.userId} joined chat session ${sessionId}`);
    } catch (error) {
      logger.error('Error joining chat session:', error);
      socket.emit('chat:error', { message: 'Failed to join session' });
    }
  });

  // Leave chat session
  socket.on('chat:leave', (sessionId: string) => {
    socket.leave(`chat:${sessionId}`);
    logger.debug(`User ${socket.data.userId} left chat session ${sessionId}`);
  });

  // Send message
  socket.on('chat:message', async (data: ChatMessage) => {
    try {
      const { sessionId, content, attachments } = data;

      // Verify session ownership
      const session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: socket.data.userId,
        },
      });

      if (!session) {
        socket.emit('chat:error', { message: 'Session not found' });
        return;
      }

      // Save user message
      const userMessage = await prisma.chatMessage.create({
        data: {
          sessionId,
          role: 'user',
          content,
          attachments,
        },
      });

      // Broadcast to session participants
      io.to(`chat:${sessionId}`).emit('chat:message', userMessage);

      // Process with AI
      socket.emit('chat:typing', { isTyping: true });
      
      try {
        const aiResponse = await processAIMessage(sessionId, content);
        
        // Save AI response
        const assistantMessage = await prisma.chatMessage.create({
          data: {
            sessionId,
            role: 'assistant',
            content: aiResponse.content,
            metadata: aiResponse.metadata,
          },
        });

        // Broadcast AI response
        io.to(`chat:${sessionId}`).emit('chat:message', assistantMessage);
      } catch (aiError) {
        logger.error('AI processing error:', aiError);
        socket.emit('chat:error', { message: 'AI service temporarily unavailable' });
      } finally {
        socket.emit('chat:typing', { isTyping: false });
      }

    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('chat:error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('chat:typing', (data: TypingEvent) => {
    const { sessionId, isTyping } = data;
    socket.to(`chat:${sessionId}`).emit('chat:typing', {
      userId: socket.data.userId,
      isTyping,
    });
  });

  // Get message history
  socket.on('chat:history', async (sessionId: string) => {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: {
          sessionId,
          session: {
            userId: socket.data.userId,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      socket.emit('chat:history', messages);
    } catch (error) {
      logger.error('Error fetching chat history:', error);
      socket.emit('chat:error', { message: 'Failed to fetch history' });
    }
  });

  // Create new session
  socket.on('chat:create', async (title?: string) => {
    try {
      const session = await prisma.chatSession.create({
        data: {
          userId: socket.data.userId,
          title: title || 'New Chat',
        },
      });

      socket.emit('chat:created', session);
      socket.join(`chat:${session.id}`);
    } catch (error) {
      logger.error('Error creating chat session:', error);
      socket.emit('chat:error', { message: 'Failed to create session' });
    }
  });

  // Delete session
  socket.on('chat:delete', async (sessionId: string) => {
    try {
      await prisma.chatSession.deleteMany({
        where: {
          id: sessionId,
          userId: socket.data.userId,
        },
      });

      socket.leave(`chat:${sessionId}`);
      socket.emit('chat:deleted', { sessionId });
    } catch (error) {
      logger.error('Error deleting chat session:', error);
      socket.emit('chat:error', { message: 'Failed to delete session' });
    }
  });
};