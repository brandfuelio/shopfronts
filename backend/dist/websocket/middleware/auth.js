"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateSocket = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const logger_1 = require("../../utils/logger");
const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return next(new Error('Authentication required'));
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // Attach user data to socket
        socket.data.userId = decoded.userId;
        socket.data.role = decoded.role;
        socket.data.email = decoded.email;
        logger_1.logger.debug(`WebSocket authenticated for user ${decoded.userId}`);
        next();
    }
    catch (error) {
        logger_1.logger.error('WebSocket authentication error:', error);
        next(new Error('Invalid token'));
    }
};
exports.authenticateSocket = authenticateSocket;
//# sourceMappingURL=auth.js.map