import {
  ipcMain,
  dialog,
  shell,
  BrowserWindow,
  app,
  Notification,
} from 'electron';
import Store from 'electron-store';
import os from 'os';
import path from 'path';
import { setCron } from './system/cron';
import type BackendServiceManager from './system/backend';
import { getBrowserVersionFromOS } from './system/chrome';

const store = new Store();

const setupIpcHandlers = (
  mainWindow: BrowserWindow,
  bsm: BackendServiceManager,
) => {
  ipcMain.on('get-env', async (event, key) => {
    event.returnValue = process.env[key];
  });

  ipcMain.on('get-port', async (event) => {
    event.returnValue = bsm.getPort();
  });

  ipcMain.on('ipc-example', async (event) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    event.reply('ipc-example', msgTemplate('pong'));
  });

  ipcMain.on('select-directory', async (event) => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    event.reply('selected-directory', result.filePaths);
  });

  ipcMain.on('select-file', async (event) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
    });
    event.reply('selected-file', result.filePaths);
  });

  ipcMain.on('open-directory', async (event, args) => {
    shell.openPath(args);
  });

  ipcMain.on('open-logger-folder', async () => {
    const logDir = path.join(os.tmpdir(), 'chatgpt-on-cs');

    shell.openPath(logDir);
  });

  ipcMain.on('electron-store-get', async (event, val) => {
    event.returnValue = store.get(val);
  });

  ipcMain.on('electron-store-set', async (event, key, val) => {
    store.set(key, val);
  });

  ipcMain.on('electron-store-remove', async (event, key) => {
    store.delete(key);
  });

  ipcMain.on('get-version', async (event) => {
    event.returnValue = app.getVersion();
  });

  ipcMain.on('open-url', async (event, url) => {
    shell.openExternal(url);
  });

  ipcMain.on('get-browser-version', async (event) => {
    const version = await getBrowserVersionFromOS();
    event.returnValue = version;
  });

  ipcMain.on('notification', async (event, title, message) => {
    const notification = {
      title,
      body: message,
    };
    new Notification(notification).show();
  });

  // 每隔 5 秒执行一次
  setCron('*/5 * * * * *', () => {
    mainWindow.webContents.send('refresh-config');
  });

  // 每隔 5 秒执行一次检查后端服务是否健康
  setCron('*/5 * * * * *', async () => {
    if (!bsm) {
      console.error('BackendServiceManager not found');
      return;
    }

    const isHealthy = await bsm.check_health();
    mainWindow.webContents.send('check-health', isHealthy);
  });
};

export default setupIpcHandlers;
