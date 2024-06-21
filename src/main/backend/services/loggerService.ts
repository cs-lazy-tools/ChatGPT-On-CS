import { BrowserWindow } from 'electron';

export class LoggerService {
  constructor(private mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  public log(msg: string) {
    console.log(msg);
    this.mainWindow.webContents.send('broadcast', {
      event: 'log_show',
      data: {
        time: new Date().toLocaleTimeString(),
        content: msg,
      },
    });
  }

  public error(msg: string) {
    console.error('[ERROR]', msg);
    this.mainWindow.webContents.send('broadcast', {
      event: 'log_show',
      data: {
        time: new Date().toLocaleTimeString(),
        content: `[ERROR] ${msg}`,
      },
    });
  }

  public info(msg: string) {
    console.info('[INFO]', msg);
    this.mainWindow.webContents.send('broadcast', {
      event: 'log_show',
      data: {
        time: new Date().toLocaleTimeString(),
        content: `[INFO] ${msg}`,
      },
    });
  }

  public warn(msg: string) {
    console.warn('[WARN]', msg);
    this.mainWindow.webContents.send('broadcast', {
      event: 'log_show',
      data: {
        time: new Date().toLocaleTimeString(),
        content: `[WARN] ${msg}`,
      },
    });
  }

  public success(msg: string) {
    console.log('[SUCCESS]', msg);
    this.mainWindow.webContents.send('broadcast', {
      event: 'log_show',
      data: {
        time: new Date().toLocaleTimeString(),
        content: `[SUCCESS] ${msg}`,
      },
    });
  }
}
