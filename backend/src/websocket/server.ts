import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { env, corsOptions } from '../config/env';
import { logger } from '../utils/logger';
import { authenticateSocket } from './middleware/auth';
import { chatHandlers } from './handlers/chat';
import { notificationHandlers } from './handlers/notifications';

export class WebSocketServer {
  private io: SocketIOServer;
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: corsOptions,
      path: env.WS_PATH,
    });

    this.setupMiddleware();
    this.setupHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(authenticateSocket);
  }

  private setupHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId;
      logger.info(`User ${userId} connected via WebSocket`);

      // Track user sockets
      this.addUserSocket(userId, socket.id);

      // Join user-specific room
      socket.join(`user:${userId}`);

      // Setup event handlers
      chatHandlers(socket, this.io);
      notificationHandlers(socket, this.io);

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`User ${userId} disconnected from WebSocket`);
        this.removeUserSocket(userId, socket.id);
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`WebSocket error for user ${userId}:`, error);
      });
    });
  }

  private addUserSocket(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  private removeUserSocket(userId: string, socketId: string) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  // Public methods for sending events
  public sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public sendToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  public getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Singleton instance
let wsServer: WebSocketServer | null = null;

export const initializeWebSocket = (httpServer: HTTPServer): WebSocketServer => {
  if (!wsServer) {
    wsServer = new WebSocketServer(httpServer);
    logger.info('✅ WebSocket server initialized');
  }
  return wsServer;
};

export const getWebSocketServer = (): WebSocketServer => {
  if (!wsServer) {
    throw new Error('WebSocket server not initialized');
  }
  return wsServer;
};