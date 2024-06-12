import express from 'express';
import cors from 'cors';
import asyncHandler from 'express-async-handler';
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';
import { BrowserWindow, shell } from 'electron';
import { sequelize } from './ormconfig';
import { StrategyServiceStatusEnum } from './types';
import { ConfigController } from './controllers/configController';
import { MessageController } from './controllers/messageController';
import { KeywordReplyController } from './controllers/keywordReplyController';
import { MessageService } from './services/messageService';
import { DispatchService } from './services/dispatchService';
import { PluginService } from './services/pluginService';
import { AppService } from './services/appService';

const configController = new ConfigController();
const messageController = new MessageController();
const keywordReplyController = new KeywordReplyController();

class BKServer {
  private app: express.Application;

  private port: number;

  private server: http.Server;

  private io: Server;

  private messageService: MessageService;

  private pluginService: PluginService;

  private dispatchService: DispatchService;

  private appService: AppService;

  constructor(port: number, mainWindow: BrowserWindow) {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(cors());
    this.port = port;

    this.server = http.createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
        // 配置使用 websocket
      },
      transports: ['websocket'],
    });

    this.messageService = new MessageService(
      configController,
      keywordReplyController,
    );

    this.pluginService = new PluginService(
      configController,
      this.messageService,
    );

    this.dispatchService = new DispatchService(
      mainWindow,
      this.io,
      configController,
      this.messageService,
      messageController,
      this.pluginService,
    );

    this.appService = new AppService(this.dispatchService, sequelize);

    this.configureSocketIO();
    this.setupRoutes();
    // 开启定时任务
    setInterval(() => {
      this.appService.initTasks();
    }, 5 * 1000);
  }

  private configureSocketIO(): void {
    this.io.on('connection', (socket) => {
      console.log('Client connected registerHandlers');
      this.dispatchService.registerHandlers(socket);

      socket.on('disconnect', () => {
        console.log('user disconnected');
        // 再关闭这个连接绑定的事件处理器
        socket.removeAllListeners();
      });
    });
  }

  private setupRoutes(): void {
    // 查看消息列表
    // this.app.get(
    //   '/api/v1/msg/list',
    //   asyncHandler(async (req, res) => {
    //     const {
    //       page,
    //       page_size: pageSize,
    //       platform_id: platformId,
    //       keyword,
    //       start_time: startTime,
    //       end_time: endTime,
    //     } = req.query;

    //     const query = {
    //       page,
    //       pageSize,
    //       platformId,
    //       keyword,
    //       startTime,
    //       endTime,
    //       orderBy: 'messages.created_at desc',
    //     };

    //     const { total, msgs } =
    //       // @ts-ignore
    //       await sessionController.listMessagesWithSessions(query);

    //     // group messages
    //     const groupedMsgs = msgs.reduce((acc: any, msg) => {
    //       acc[msg.username] = acc[msg.username] || [];
    //       acc[msg.username].push(msg);
    //       return acc;
    //     }, {});
    //     res.json({
    //       success: true,
    //       data: groupedMsgs,
    //       total,
    //       page,
    //       page_size: pageSize,
    //     });
    //   }),
    // );

    // 获取所有平台
    this.app.get(
      '/api/v1/base/platform/all',
      asyncHandler(async (req, res) => {
        const data = await this.dispatchService.getAllPlatforms();
        res.json({
          success: data && data.length > 0,
          data,
        });
      }),
    );

    // 取得平台是否激活
    this.app.get(
      '/api/v1/base/platform/active',
      asyncHandler(async (req, res) => {
        const { appId, instanceId } = req.query;
        const active = await configController.checkConfigActive({
          appId: appId ? String(appId) : undefined,
          instanceId: instanceId ? String(instanceId) : undefined,
        });
        res.json({
          success: true,
          data: {
            active,
          },
        });
      }),
    );

    // 更新平台激活状态
    this.app.post(
      '/api/v1/base/platform/active',
      asyncHandler(async (req, res) => {
        const { appId, instanceId, active } = req.body;
        await configController.activeConfig({
          appId: appId ? String(appId) : undefined,
          instanceId: instanceId ? String(instanceId) : undefined,
          active,
        });
        res.json({
          success: true,
        });
      }),
    );

    // 获取配置
    this.app.get(
      '/api/v1/base/setting',
      asyncHandler(async (req, res) => {
        const { appId, instanceId, type } = req.query;
        const data = {
          appId: appId ? String(appId) : undefined,
          instanceId: instanceId ? String(instanceId) : undefined,
          type: type ? String(type) : 'generic',
        };

        const obj = await configController.getConfigByType(data);
        const active = await configController.checkConfigActive(data);

        res.json({
          success: true,
          data: {
            ...obj,
            active,
          },
        });
      }),
    );

    // 更新配置
    this.app.post(
      '/api/v1/base/setting',
      asyncHandler(async (req, res) => {
        const { appId, instanceId, type, cfg } = req.body;
        const data = {
          appId: appId ? String(appId) : undefined,
          instanceId: instanceId ? String(instanceId) : undefined,
          type: type ? String(type) : 'generic',
          cfg,
        };

        await configController.updateConfigByType(data);
        res.json({ success: true });
      }),
    );

    // Endpoint to update runner status based on incoming configuration
    this.app.post('/api/v1/base/runner', async (req, res) => {
      const {
        is_paused: isPaused,
        is_keyword_match: isKeywordMatch,
        is_use_gpt: isUseGptReply,
      } = req.body;
      try {
        if (isPaused) {
          await this.dispatchService.updateStatus(
            StrategyServiceStatusEnum.STOPPED,
          );
        } else {
          await this.dispatchService.updateStatus(
            StrategyServiceStatusEnum.RUNNING,
          );
        }

        this.messageService.updateKeywordMatch(isKeywordMatch, isUseGptReply);

        res.json({ success: true });
      } catch (error) {
        if (error instanceof Error) {
          res.status(500).json({ success: false, message: error.message });
        }
      }
    });

    this.app.get('/api/v1/reply/list', async (req, res) => {
      const { page = 1, page_size: pageSize, ptf_id: platformId } = req.query;

      const query = {
        page,
        pageSize,
        platformId,
      };

      // @ts-ignore
      const { total, autoReplies } = await keywordReplyController.list(query);

      const data = autoReplies;
      const ptfs = await this.dispatchService.getAllPlatforms();

      const ptfMap = new Map(ptfs.map((ptf) => [ptf.id, ptf]));
      const results: any[] = [];
      data.forEach((item) => {
        const ptfId = item.platform_id;
        const ptf = ptfMap.get(ptfId);

        const result = {
          id: item.id,
          platform_id: item.platform_id,
          keyword: item.keyword,
          reply: item.reply,
          mode: item.mode,
          ptf_name: ptf ? ptf.name : '全局',
        };

        results.push(result);
      });

      res.json({
        success: true,
        data: results,
        total,
        page,
        page_size: pageSize,
      });
    });

    this.app.post('/api/v1/reply/create', async (req, res) => {
      const { platform_id: platformId, keyword, reply, mode } = req.body;
      await keywordReplyController.create({
        mode,
        platform_id: platformId,
        keyword,
        reply,
      });
      res.json({ success: true });
    });

    this.app.post('/api/v1/reply/update', async (req, res) => {
      const { id, platform_id: platformId, keyword, reply, mode } = req.body;
      await keywordReplyController.update(id, {
        mode,
        platform_id: platformId,
        keyword,
        reply,
      });
      res.json({ success: true });
    });

    this.app.post('/api/v1/reply/delete', async (req, res) => {
      const { id } = req.body;
      await keywordReplyController.delete(id);
      res.json({ success: true });
    });

    this.app.post('/api/v1/reply/excel', async (req, res) => {
      const { path } = req.body;
      try {
        await keywordReplyController.importExcel(path);
        res.json({ success: true });
      } catch (error) {
        // @ts-ignore
        res.status(500).json({ success: false, message: error.message });
      }
    });

    this.app.get('/api/v1/reply/excel', async (req, res) => {
      try {
        const path = await keywordReplyController.exportExcel();
        shell.openPath(path);
        res.json({ success: true, data: path });
      } catch (error) {
        // @ts-ignore
        res.status(500).json({ success: false, message: error.message });
      }
    });

    // Health check endpoint
    // TODO: 后续需要根据通过 WS 去检查后端服务是否健康
    this.app.get('/api/v1/base/health', async (req, res) => {
      try {
        const resp = await this.dispatchService.checkHealth();
        if (resp) {
          res.json({
            success: true,
            data: true,
          });
        }
      } catch (error) {
        console.error(error);
        res.json({
          success: false,
          data: false,
        });
      }
    });

    // 检查 GPT 链接是否正常
    this.app.post('/api/v1/base/gpt/health', async (req, res) => {
      const { cfg } = req.body;
      try {
        const resp = await this.messageService.checkGptHealth(cfg);
        res.json(resp);
      } catch (error) {
        console.error(error);
        res.json({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // 检查插件是否正常工作
    this.app.post('/api/v1/base/plugin/check', async (req, res) => {
      try {
        const { code, messages, ctx } = req.body;
        const ctxMap = new Map(Object.entries(ctx));
        const resp = await this.pluginService.checkPlugin(
          code,
          // @ts-ignore
          ctxMap,
          messages,
        );
        res.json(resp);
      } catch (error) {
        res.json({
          success: false,
          error: error instanceof Error ? error.message : String(error),
          message: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // 获取任务列表
    this.app.get('/api/v1/strategy/tasks', async (req, res) => {
      try {
        const tasks = await this.appService.getTasks();
        res.json({
          success: true,
          data: tasks,
        });
      } catch (error) {
        console.error(error);
        res.json({
          success: false,
          data: null,
        });
      }
    });

    // 添加任务
    this.app.post('/api/v1/strategy/tasks', async (req, res) => {
      const { appId } = req.body;
      try {
        const task = await this.appService.addTask(String(appId));
        res.json({
          success: true,
          data: task,
        });
      } catch (error) {
        console.error(error);
        res.json({
          success: false,
          data: null,
        });
      }
    });

    // 删除任务
    this.app.post('/api/v1/strategy/task/remove', async (req, res) => {
      const { taskId } = req.body;
      try {
        await this.appService.removeTask(String(taskId));
        res.json({
          success: true,
        });
      } catch (error) {
        console.error(error);
        res.json({
          success: false,
        });
      }
    });
  }

  // 启动服务器的方法
  start() {
    return new Promise((resolve, reject) => {
      this.server = this.server
        .listen(this.port, () => {
          console.log(`Server is running on http://localhost:${this.port}`);
          resolve(true);
        })
        .on('error', reject);
    });
  }

  // 停止服务器的方法
  stop() {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(true);
        });
      } else {
        reject(new Error('Server not initialized'));
      }
    });
  }
}

export default BKServer;
