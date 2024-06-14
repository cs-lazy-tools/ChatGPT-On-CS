import axios from 'axios';
import { BrowserWindow } from 'electron';
import { setCron } from './system/cron';
import type BackendServiceManager from './system/backend';

const setupCron = (mainWindow: BrowserWindow, bsm: BackendServiceManager) => {
  const baseURL = (url: string) => {
    return `http://127.0.0.1:${bsm.getPort()}/${url}`;
  };

  // 每隔 5 秒执行一次，通知和渲染进程刷新配置
  setCron('*/5 * * * * *', () => {
    mainWindow.webContents.send('refresh-config');
  });

  // 每隔 5 秒执行一次检查后端服务是否健康
  setCron('*/5 * * * * *', async () => {
    if (!bsm) {
      console.error('BackendServiceManager not found');
      return;
    }

    const {
      data: { data },
    } = await axios.get(baseURL(`api/v1/base/health`));
    mainWindow.webContents.send('check-health', data);
  });

  // 每隔 5 秒同步一次 Backend 服务的状态
  setCron('*/20 * * * * *', async () => {
    if (!bsm) {
      console.error('BackendServiceManager not found');
      return;
    }

    // 为了避免依赖麻烦，这里直接通过 axios 发送请求
    try {
      await axios.post(baseURL('api/v1/base/sync'), {});
    } catch (error) {
      console.error('Error syncing backend service status:', error);
    }
  });
};

export default setupCron;
