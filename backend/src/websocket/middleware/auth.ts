import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    // Attach user data to socket
    socket.data.userId = decoded.userId;
    socket.data.role = decoded.role;
    socket.data.email = decoded.email;

    logger.debug(`WebSocket authenticated for user ${decoded.userId}`);
    next();
  } catch (error) {
    logger.error('WebSocket authentication error:', error);
    next(new Error('Invalid token'));
  }
};