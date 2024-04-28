import socketIo from 'socket.io';
import { BrowserWindow } from 'electron';

export class BroadcastService {
  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  public registerHandlers(socket: socketIo.Socket): void {
    socket.on('broadcastService-sendBroadcast', (msg: any, callback) => {
      const { event_id: eventId, message } = msg;
      this.receiveBroadcast(msg);
      callback({
        event_id: eventId,
        event_type: message,
      });
    });
  }

  public receiveBroadcast(msg: any): void {
    this.mainWindow.webContents.send('broadcast', msg);
  }
}
