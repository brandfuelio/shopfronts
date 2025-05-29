"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatHandlers = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../../utils/logger");
const ai_service_1 = require("../../services/ai.service");
const prisma = new client_1.PrismaClient();
const chatHandlers = (socket, io) => {
    // Join chat session
    socket.on('chat:join', async (sessionId) => {
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
            logger_1.logger.debug(`User ${socket.data.userId} joined chat session ${sessionId}`);
        }
        catch (error) {
            logger_1.logger.error('Error joining chat session:', error);
            socket.emit('chat:error', { message: 'Failed to join session' });
        }
    });
    // Leave chat session
    socket.on('chat:leave', (sessionId) => {
        socket.leave(`chat:${sessionId}`);
        logger_1.logger.debug(`User ${socket.data.userId} left chat session ${sessionId}`);
    });
    // Send message
    socket.on('chat:message', async (data) => {
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
                const aiResponse = await (0, ai_service_1.processAIMessage)(sessionId, content);
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
            }
            catch (aiError) {
                logger_1.logger.error('AI processing error:', aiError);
                socket.emit('chat:error', { message: 'AI service temporarily unavailable' });
            }
            finally {
                socket.emit('chat:typing', { isTyping: false });
            }
        }
        catch (error) {
            logger_1.logger.error('Error sending message:', error);
            socket.emit('chat:error', { message: 'Failed to send message' });
        }
    });
    // Typing indicator
    socket.on('chat:typing', (data) => {
        const { sessionId, isTyping } = data;
        socket.to(`chat:${sessionId}`).emit('chat:typing', {
            userId: socket.data.userId,
            isTyping,
        });
    });
    // Get message history
    socket.on('chat:history', async (sessionId) => {
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
        }
        catch (error) {
            logger_1.logger.error('Error fetching chat history:', error);
            socket.emit('chat:error', { message: 'Failed to fetch history' });
        }
    });
    // Create new session
    socket.on('chat:create', async (title) => {
        try {
            const session = await prisma.chatSession.create({
                data: {
                    userId: socket.data.userId,
                    title: title || 'New Chat',
                },
            });
            socket.emit('chat:created', session);
            socket.join(`chat:${session.id}`);
        }
        catch (error) {
            logger_1.logger.error('Error creating chat session:', error);
            socket.emit('chat:error', { message: 'Failed to create session' });
        }
    });
    // Delete session
    socket.on('chat:delete', async (sessionId) => {
        try {
            await prisma.chatSession.deleteMany({
                where: {
                    id: sessionId,
                    userId: socket.data.userId,
                },
            });
            socket.leave(`chat:${sessionId}`);
            socket.emit('chat:deleted', { sessionId });
        }
        catch (error) {
            logger_1.logger.error('Error deleting chat session:', error);
            socket.emit('chat:error', { message: 'Failed to delete session' });
        }
    });
};
exports.chatHandlers = chatHandlers;
//# sourceMappingURL=chat.js.map