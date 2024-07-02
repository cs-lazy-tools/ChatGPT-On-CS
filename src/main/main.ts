/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'source-map-support/register';
import './system/logger';
import path from 'path';
import { app, BrowserWindow, shell } from 'electron';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import setupIpcHandlers from './ipcHandlers';
import setupCron from './cron';
import BackendServiceManager from './system/backend';
import Server from './backend/backend';

let mainWindow: BrowserWindow | null = null;
let backendServiceManager: BackendServiceManager | null = null;

const stopBackendServiceManager = async () => {
  if (backendServiceManager) {
    await backendServiceManager.stop();
  }
};

// 修复 GPU process isn't usable. Goodbye. 错误
// https://learn.microsoft.com/en-us/answers/questions/1193062/how-to-fix-electron-program-gpu-process-isnt-usabl
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('lang', 'zh-CN');

app.on('window-all-closed', async () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  console.log('window-all-closed');
  await stopBackendServiceManager();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  console.log('before-quit');
  await stopBackendServiceManager();
});

const originalUncaughtException = process.listeners('uncaughtException').pop();
process.removeAllListeners('uncaughtException');
process.on('uncaughtException', async (error, origin) => {
  console.error('An error occurred in the main process:', error);
  console.error(error.stack);
  await stopBackendServiceManager();
  originalUncaughtException?.(error, origin);
});

const gotTheLock = app.requestSingleInstanceLock();

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

// 安装开发者工具，如果网络不好，可以注释掉
// const installExtensions = async () => {
//   const installer = require('electron-devtools-installer');
//   const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
//   const extensions = ['REACT_DEVELOPER_TOOLS'];

//   return installer
//     .default(
//       extensions.map((name) => installer[name]),
//       forceDownload,
//     )
//     .catch(console.log);
// };

const createWindow = async () => {
  if (isDebug) {
    // await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  backendServiceManager = new BackendServiceManager(
    path.join(
      RESOURCES_PATH,
      process.env.BKEXE_PATH || './backend/__main__.exe',
    ),
  );

  await backendServiceManager.start();

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 528,
    height: 1024,
    resizable: false, // 防止用户调整窗口大小
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  if (!gotTheLock) {
    // 如果获取不到锁，说明已有一个实例在运行，直接退出
    app.quit();
    return;
  }

  setupIpcHandlers(mainWindow, backendServiceManager);
  setupCron(mainWindow, backendServiceManager);

  const server = new Server(backendServiceManager.getPort(), mainWindow);
  // 启动服务器
  server
    .start()
    .then(() => {
      console.log('Server started successfully');
    })
    .catch((err) => {
      console.error('Error starting server:', err);
    });

  mainWindow.loadURL(resolveHtmlPath('main.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    // 确保所有窗口关闭后退出应用
    if (BrowserWindow.getAllWindows().length === 0) {
      app.quit();
    }
  });

  mainWindow.on('close', async () => {
    // 停止后台服务
    await stopBackendServiceManager();
    // 关闭所有窗口
    BrowserWindow.getAllWindows().forEach((win) => {
      if (win !== mainWindow) {
        win.close();
      }
    });
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
