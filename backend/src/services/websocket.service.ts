import { Server as SocketIOServer } from 'socket.io';

export class WebSocketService {
  private static io: SocketIOServer | null = null;

  static setIO(io: SocketIOServer) {
    this.io = io;
  }

  static getIO(): SocketIOServer | null {
    return this.io;
  }

  static emit(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  static emitToRoom(room: string, event: string, data: any) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }

  static emitToUser(userId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }
}