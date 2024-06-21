import path from 'path';
import { app, BrowserWindow, shell } from 'electron';
import { resolveHtmlPath } from '../../util';

let dataviewWindow: BrowserWindow | null = null;

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

export const createWindow = async (args: string[]) => {
  if (isDebug) {
    // await installExtensions();
  }

  if (dataviewWindow) {
    dataviewWindow.focus();
    dataviewWindow.webContents.send('update-dataview-params', args);
    return;
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  dataviewWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../../../.erb/dll/preload.js'),
      additionalArguments: args,
    },
  });

  dataviewWindow.loadURL(resolveHtmlPath('dataview.html'));

  dataviewWindow.on('ready-to-show', () => {
    if (!dataviewWindow) {
      throw new Error('"dataviewWindow" is not defined');
    }

    dataviewWindow.show();
  });

  dataviewWindow.on('closed', () => {
    dataviewWindow = null;
  });

  // Open urls in the user's browser
  dataviewWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};
