// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'ipc-example'
  | 'get-env'
  | 'get-port'
  | 'check-health'
  | 'electron-store-get'
  | 'electron-store-set'
  | 'electron-store-remove'
  | 'refresh-config'
  | 'open-directory'
  | 'open-logger-folder'
  | 'select-file'
  | 'selected-file'
  | 'select-directory'
  | 'selected-directory'
  | 'open-url'
  | 'notification'
  | 'get-browser-version'
  | 'broadcast'
  | 'open-settings-window'
  | 'open-dataview-window'
  | 'update-settings-params'
  | 'get-version';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    get(channel: Channels) {
      return ipcRenderer.sendSync(channel);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    // 这个once方法是特别的，因为它确保了事件处理函数只会被调用一次，然后自动移除。
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    remove(channel: Channels) {
      ipcRenderer.removeAllListeners(channel);
    },
    removeListener(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.removeListener(channel, func);
    },
  },
  store: {
    get(key: string) {
      return ipcRenderer.sendSync('electron-store-get', key);
    },
    set(key: string, value: string) {
      ipcRenderer.send('electron-store-set', key, value);
    },
    remove(key: string) {
      ipcRenderer.send('electron-store-remove', key);
    },
  },
  getEnv: (key: string) => {
    const v = ipcRenderer.sendSync('get-env', key);
    return v;
  },
  getPort: () => {
    const v = ipcRenderer.sendSync('get-port');
    return v;
  },
  getArgs: () => process.argv,
};

export type ElectronHandler = typeof electronHandler;

// 把功能暴露给渲染进程
contextBridge.exposeInMainWorld('electron', electronHandler);
