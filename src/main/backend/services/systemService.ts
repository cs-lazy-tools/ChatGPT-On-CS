import socketIo from 'socket.io';

export class SystemService {
  private io: socketIo.Server;

  constructor(io: socketIo.Server) {
    this.io = io;
  }

  async checkHealth(): Promise<boolean> {
    try {
      return await this.io.timeout(5000).emitWithAck('systemService-health');
    } catch (error) {
      console.error('Failed to check health', error);
      return false;
    }
  }
}
