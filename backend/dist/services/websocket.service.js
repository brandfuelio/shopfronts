"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
class WebSocketService {
    static io = null;
    static setIO(io) {
        this.io = io;
    }
    static getIO() {
        return this.io;
    }
    static emit(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
    static emitToRoom(room, event, data) {
        if (this.io) {
            this.io.to(room).emit(event, data);
        }
    }
    static emitToUser(userId, event, data) {
        if (this.io) {
            this.io.to(`user:${userId}`).emit(event, data);
        }
    }
}
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=websocket.service.js.map