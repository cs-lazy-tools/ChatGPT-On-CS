import socketIo from 'socket.io';
import { BrowserWindow } from 'electron';
import { Platform, StrategyServiceStatusEnum } from '../types';
import { emitAndWait } from '../../utils';
import { MessageService } from './messageService';
import PluginService from './pluginService';
import { ConfigController } from '../controllers/configController';
import { MessageController } from '../controllers/messageController';
import { Instance } from '../entities/instance';
import { PluginDefaultRunCode } from '../constants';

export class DispatchService {
  private mainWindow: BrowserWindow;

  private messageService: MessageService;

  private messageController: MessageController;

  private io: socketIo.Server;

  private configController: ConfigController;

  private pluginService: PluginService;

  constructor(
    mainWindow: BrowserWindow,
    io: socketIo.Server,
    configService: ConfigController,
    messageService: MessageService,
    messageController: MessageController,
    pluginService: PluginService,
  ) {
    this.io = io;
    this.mainWindow = mainWindow;
    this.messageService = messageService;
    this.messageController = messageController;
    this.configController = configService;
    this.pluginService = pluginService;
  }

  public registerHandlers(socket: socketIo.Socket): void {
    socket.on('messageService-broadcast', (msg: any, callback) => {
      const { event_id: eventId, message } = msg;
      this.receiveBroadcast(msg);
      callback({
        event_id: eventId,
        event_type: message,
      });
    });

    socket.on('messageService-getMessages', async (data, callback) => {
      const { ctx, messages } = data;
      const ctxMap = new Map<string, string>();
      Object.keys(ctx).forEach((key) => {
        ctxMap.set(key, ctx[key]);
      });

      let reply: any;

      // 检查是否使用插件
      const cfg = await this.configController.get(ctxMap);
      await this.messageService.extractMsgInfo(cfg, ctxMap, messages);
      if (cfg.use_plugin && cfg.plugin_id) {
        reply = await this.pluginService.executePlugin(
          cfg.plugin_id,
          ctx,
          messages,
        );
      } else {
        reply = await this.pluginService.executePluginCode(
          PluginDefaultRunCode,
          ctxMap,
          messages,
        );
      }

      callback(reply);

      // 回复后保存消息
      await this.messageController.saveMessages(ctxMap, reply, messages);
    });
  }

  public receiveBroadcast(msg: any): void {
    this.mainWindow.webContents.send('broadcast', msg);
  }

  public async checkHealth(): Promise<boolean> {
    try {
      return await this.io.timeout(5000).emitWithAck('systemService-health');
    } catch (error) {
      console.error('Failed to check health', error);
      return false;
    }
  }

  public async updateTasks(tasks: Instance[]): Promise<
    | {
        task_id: string;
        env_id: string;
      }[]
    | null
  > {
    try {
      return await emitAndWait(this.io, 'strategyService-updateTasks', {
        tasks: tasks.map((task) => ({
          task_id: task.id,
          app_id: task.app_id,
          env_id: task.env_id,
        })),
      });
    } catch (error) {
      console.error('Failed to add task', error);
      return null;
    }
  }

  public async updateStatus(status: StrategyServiceStatusEnum): Promise<any> {
    try {
      return await emitAndWait(this.io, 'strategyService-updateStatus', {
        status,
      });
    } catch (error) {
      console.error('Failed to update status', error);
      return null;
    }
  }

  public async getAllPlatforms(): Promise<Platform[]> {
    const maxRetries = 10;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const data = await emitAndWait<Platform[]>(
          this.io,
          'strategyService-getAppsInfo',
        );
        return data;
      } catch (error) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempt++;
        console.error(`Attempt ${attempt} failed to update strategies`, error);
        if (attempt >= maxRetries) {
          return [];
        }
      }
    }

    return [];
  }
}
