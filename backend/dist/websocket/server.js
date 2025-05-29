"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebSocketServer = exports.initializeWebSocket = exports.WebSocketServer = void 0;
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const auth_1 = require("./middleware/auth");
const chat_1 = require("./handlers/chat");
const notifications_1 = require("./handlers/notifications");
class WebSocketServer {
    io;
    userSockets = new Map();
    constructor(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: env_1.corsOptions,
            path: env_1.env.WS_PATH,
        });
        this.setupMiddleware();
        this.setupHandlers();
    }
    setupMiddleware() {
        // Authentication middleware
        this.io.use(auth_1.authenticateSocket);
    }
    setupHandlers() {
        this.io.on('connection', (socket) => {
            const userId = socket.data.userId;
            logger_1.logger.info(`User ${userId} connected via WebSocket`);
            // Track user sockets
            this.addUserSocket(userId, socket.id);
            // Join user-specific room
            socket.join(`user:${userId}`);
            // Setup event handlers
            (0, chat_1.chatHandlers)(socket, this.io);
            (0, notifications_1.notificationHandlers)(socket, this.io);
            // Handle disconnection
            socket.on('disconnect', () => {
                logger_1.logger.info(`User ${userId} disconnected from WebSocket`);
                this.removeUserSocket(userId, socket.id);
            });
            // Handle errors
            socket.on('error', (error) => {
                logger_1.logger.error(`WebSocket error for user ${userId}:`, error);
            });
        });
    }
    addUserSocket(userId, socketId) {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId).add(socketId);
    }
    removeUserSocket(userId, socketId) {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            sockets.delete(socketId);
            if (sockets.size === 0) {
                this.userSockets.delete(userId);
            }
        }
    }
    // Public methods for sending events
    sendToUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, data);
    }
    sendToAll(event, data) {
        this.io.emit(event, data);
    }
    isUserOnline(userId) {
        return this.userSockets.has(userId);
    }
    getOnlineUsers() {
        return Array.from(this.userSockets.keys());
    }
    getIO() {
        return this.io;
    }
}
exports.WebSocketServer = WebSocketServer;
// Singleton instance
let wsServer = null;
const initializeWebSocket = (httpServer) => {
    if (!wsServer) {
        wsServer = new WebSocketServer(httpServer);
        logger_1.logger.info('✅ WebSocket server initialized');
    }
    return wsServer;
};
exports.initializeWebSocket = initializeWebSocket;
const getWebSocketServer = () => {
    if (!wsServer) {
        throw new Error('WebSocket server not initialized');
    }
    return wsServer;
};
exports.getWebSocketServer = getWebSocketServer;
//# sourceMappingURL=server.js.map