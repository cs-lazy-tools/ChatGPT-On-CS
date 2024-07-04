import socketIo from 'socket.io';
import { BrowserWindow } from 'electron';
import { Platform, ReplyDTO, StrategyServiceStatusEnum } from '../types';
import { emitAndWait } from '../../utils';
import { MessageService } from './messageService';
import PluginService from './pluginService';
import { ConfigController } from '../controllers/configController';
import { MessageController } from '../controllers/messageController';
import { Instance } from '../entities/instance';
import { PluginDefaultRunCode } from '../constants';
import { LoggerService } from './loggerService';

export class DispatchService {
  constructor(
    private mainWindow: BrowserWindow,
    private log: LoggerService,
    private io: socketIo.Server,
    private configController: ConfigController,
    private messageService: MessageService,
    private messageController: MessageController,
    private pluginService: PluginService,
  ) {
    this.io = io;
    this.log = log;
    this.mainWindow = mainWindow;
    this.messageService = messageService;
    this.messageController = messageController;
    this.configController = configController;
    this.pluginService = pluginService;
  }

  public registerHandlers(socket: socketIo.Socket): void {
    socket.on('messageService-broadcast', async (msg: any, callback) => {
      const { event, data } = msg;
      if (event === 'key_esc') {
        const change = await this.configController.escKeyDowHandler();
        if (change) {
          this.syncConfig();
          this.receiveBroadcast({
            event: 'has_paused',
            data: {},
          });
        }
      } else {
        this.receiveBroadcast(msg);
      }

      callback({
        event,
        data,
      });
    });

    socket.on('messageService-getMessages', async (data, callback) => {
      const { ctx, msgs } = data;
      const ctxMap = new Map<string, string>();
      Object.keys(ctx).forEach((key) => {
        ctxMap.set(key, ctx[key]);
      });

      let reply: ReplyDTO;

      // 检查是否使用插件
      const cfg = await this.configController.get(ctxMap);
      await this.messageService.extractMsgInfo(cfg, ctxMap, msgs);

      try {
        if (cfg.use_plugin && cfg.plugin_id) {
          reply = await this.pluginService.executePlugin(
            cfg.plugin_id,
            ctxMap,
            msgs,
          );

          this.log.info(`使用自定义插件回复: ${reply.content}`);
        } else {
          const reply_data = await this.pluginService.executePluginCode(
            PluginDefaultRunCode,
            ctxMap,
            msgs,
          );

          reply = reply_data.data;
        }
      } catch (error) {
        console.error('Failed to execute plugin', error);
        this.log.error(
          `回复失败: ${
            error instanceof Error ? error.message : String(error)
          }，使用默认回复`,
        );

        reply = await this.messageService.getDefaultReply(cfg);
      }

      callback(reply);

      if (reply.type !== 'NO_REPLY') {
        // 回复后保存消息
        await this.messageController.saveMessages(ctxMap, reply, msgs);
      }
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

  public async syncConfig(): Promise<boolean> {
    try {
      let cfg = await this.configController.getConfigByType({
        appId: undefined,
        instanceId: undefined,
        type: 'driver',
      });

      if (!cfg) {
        return false;
      }

      let hasPaused = false;
      if ('hasPaused' in cfg) {
        hasPaused = cfg.hasPaused || false;
      }

      cfg = await this.configController.getConfigByType({
        appId: undefined,
        instanceId: undefined,
        type: 'generic',
      });

      if (!cfg) {
        return false;
      }

      let jdr = '很高兴为您服务，请问有什么可以帮您？';
      if ('jinritemaiDefaultReplyMatch' in cfg) {
        jdr = cfg.jinritemaiDefaultReplyMatch || '';
      }

      let twkey = '';
      if ('truncateWordKey' in cfg) {
        twkey = cfg.truncateWordKey || '';
      }

      let twcount = 210;
      if ('truncateWordCount' in cfg) {
        twcount = cfg.truncateWordCount || 210;
      }

      await emitAndWait(this.io, 'strategyService-updateStatus', {
        status: hasPaused
          ? StrategyServiceStatusEnum.STOPPED
          : StrategyServiceStatusEnum.RUNNING,
        jdr,
        twkey,
        twcount,
      });

      const instances = await Instance.findAll();
      await this.updateTasks(instances);
      return true;
    } catch (error) {
      console.error('Failed to sync config', error);
      return false;
    }
  }

  public async updateTasks(tasks: Instance[]): Promise<
    | {
        task_id: string;
        env_id: string;
        error?: string;
      }[]
    | null
  > {
    try {
      return await emitAndWait(
        this.io,
        'strategyService-updateTasks',
        {
          tasks: tasks.map((task) => ({
            task_id: task.id,
            app_id: task.app_id,
            env_id: task.env_id,
          })),
        },
        20000,
      );
    } catch (error) {
      console.error('Failed to add task', error);
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
