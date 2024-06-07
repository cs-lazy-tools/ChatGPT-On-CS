import express from 'express';
import cors from 'cors';
import asyncHandler from 'express-async-handler';
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';
import { BrowserWindow, shell } from 'electron';
import './ormconfig';
import { StrategyServiceStatusEnum } from './types';
import { SessionController } from './controllers/sessionController';
import { ConfigController } from './controllers/configController';
import { MessageController } from './controllers/messageController';
import { StrategyService } from './services/strategyService';
import { MessageService } from './services/messageService';
import { SessionService } from './services/sessionService';
import { BroadcastService } from './services/broadcastService';
import { SystemService } from './services/systemService';
import { ConfigService } from './services/configService';
import { PlatformConfigController } from './controllers/platformConfigController';
import { AutoReplyController } from './controllers/keywordReplyController';

const sessionController = new SessionController();
const configController = new ConfigController();
const platformConfigController = new PlatformConfigController();
const messageController = new MessageController();
const autoReplyController = new AutoReplyController();

class BKServer {
  private app: express.Application;

  private port: number;

  private server: http.Server;

  private io: Server;

  private strategyService: StrategyService;

  private messageService: MessageService;

  private sessionService: SessionService;

  private configService: ConfigService;

  private broadcastService: BroadcastService;

  private systemService: SystemService;

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

    this.configService = new ConfigService(
      configController,
      platformConfigController,
    );

    this.messageService = new MessageService(
      this.configService,
      messageController,
      autoReplyController,
    );

    this.broadcastService = new BroadcastService(mainWindow);
    this.strategyService = new StrategyService(this.io);
    this.sessionService = new SessionService(
      sessionController,
      this.strategyService,
    );
    this.systemService = new SystemService(this.io);
    this.configureSocketIO();
    this.setupRoutes();
  }

  private configureSocketIO(): void {
    this.io.on('connection', (socket) => {
      console.log('Client connected registerHandlers');
      this.messageService.registerHandlers(socket);
      this.sessionService.registerHandlers(socket);
      this.broadcastService.registerHandlers(socket);

      socket.on('disconnect', () => {
        console.log('user disconnected');
        // 再关闭这个连接绑定的事件处理器
        socket.removeAllListeners();
      });
    });
  }

  private setupRoutes(): void {
    // 查看消息列表
    this.app.get(
      '/api/v1/msg/list',
      asyncHandler(async (req, res) => {
        const {
          page,
          page_size: pageSize,
          platform_id: platformId,
          keyword,
          start_time: startTime,
          end_time: endTime,
        } = req.query;

        const query = {
          page,
          pageSize,
          platformId,
          keyword,
          startTime,
          endTime,
          orderBy: 'messages.created_at desc',
        };

        const { total, msgs } =
          // @ts-ignore
          await sessionController.listMessagesWithSessions(query);

        // group messages
        const groupedMsgs = msgs.reduce((acc: any, msg) => {
          acc[msg.username] = acc[msg.username] || [];
          acc[msg.username].push(msg);
          return acc;
        }, {});
        res.json({
          success: true,
          data: groupedMsgs,
          total,
          page,
          page_size: pageSize,
        });
      }),
    );

    // 获取所有平台
    this.app.get(
      '/api/v1/base/platform/all',
      asyncHandler(async (req, res) => {
        const data = await this.strategyService.getAllPlatforms();
        res.json({
          success: data && data.length > 0,
          data,
        });
      }),
    );

    // 获取平台设置
    this.app.get(
      '/api/v1/base/platform/setting',
      asyncHandler(async (req, res) => {
        const { platformId } = req.query;
        // @ts-ignore
        const obj = await platformConfigController.getByPlatformId(platformId);
        res.json({ success: true, data: obj.settings });
      }),
    );

    this.app.post(
      '/api/v1/base/platform/setting',
      asyncHandler(async (req, res) => {
        const { platformId, settings } = req.body;
        await platformConfigController.updateByPlatformId(platformId, settings);
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
          await this.strategyService.updateStatus(
            StrategyServiceStatusEnum.STOPPED,
          );
        } else {
          await this.strategyService.updateStatus(
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

    // Endpoint to retrieve configuration settings
    this.app.get('/api/v1/base/settings', async (req, res) => {
      try {
        const config = await configController.getConfig();
        // @ts-ignore 兼容性处理
        config.reply_speed = [config.reply_speed, config.reply_random_speed];
        res.json({ success: true, data: config });
      } catch (error) {
        if (error instanceof Error) {
          res.status(500).json({ success: false, message: error.message });
        }
      }
    });

    // Endpoint to update configuration settings
    this.app.post('/api/v1/base/settings', async (req, res) => {
      try {
        const cfg = req.body as {
          extract_phone: boolean; // 提取手机号
          extract_product: boolean; // 提取商品
          save_path?: string; // 保存路径
          default_reply?: string; // 默认回复
          reply_speed: number[]; // 回复速度
          context_count: number; // 合并消息数量
          wait_humans_time: number; // 等待人工时间
          gpt_base_url?: string; // GPT服务地址
          gpt_key?: string; // GPT服务key
          gpt_model?: string; // GPT服务模型
          gpt_temperature?: number; // GPT服务温度
          gpt_top_p?: number; // GPT服务top_p
          stream?: boolean; // 是否开启stream
          use_dify?: boolean; // 是否使用 Dify 百宝箱
        };

        if (!cfg.reply_speed || cfg.reply_speed.length !== 2) {
          cfg.reply_speed = [0, 0];
        }

        await configController.updateConfig(1, {
          extract_phone: cfg.extract_phone,
          extract_product: cfg.extract_product,
          default_reply: cfg.default_reply,
          save_path: cfg.save_path,
          reply_speed: cfg.reply_speed[0],
          reply_random_speed: cfg.reply_speed[1],
          context_count: cfg.context_count,
          wait_humans_time: cfg.wait_humans_time,
          gpt_base_url: cfg.gpt_base_url,
          gpt_key: cfg.gpt_key,
          gpt_model: cfg.gpt_model,
          gpt_temperature: cfg.gpt_temperature,
          gpt_top_p: cfg.gpt_top_p,
          stream: cfg.stream,
          use_dify: cfg.use_dify,
        });
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
      const { total, autoReplies } = await autoReplyController.list(query);

      const data = autoReplies;
      const ptfs = await this.strategyService.getAllPlatforms();

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
      await autoReplyController.create({
        mode,
        platform_id: platformId,
        keyword,
        reply,
      });
      res.json({ success: true });
    });

    this.app.post('/api/v1/reply/update', async (req, res) => {
      const { id, platform_id: platformId, keyword, reply, mode } = req.body;
      await autoReplyController.update(id, {
        mode,
        platform_id: platformId,
        keyword,
        reply,
      });
      res.json({ success: true });
    });

    this.app.post('/api/v1/reply/delete', async (req, res) => {
      const { id } = req.body;
      await autoReplyController.delete(id);
      res.json({ success: true });
    });

    this.app.post('/api/v1/reply/excel', async (req, res) => {
      const { path } = req.body;
      try {
        await autoReplyController.importExcel(path);
        res.json({ success: true });
      } catch (error) {
        // @ts-ignore
        res.status(500).json({ success: false, message: error.message });
      }
    });

    this.app.get('/api/v1/reply/excel', async (req, res) => {
      try {
        const path = await autoReplyController.exportExcel();
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
        const resp = await this.systemService.checkHealth();
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
    this.app.get('/api/v1/base/gpt/health', async (req, res) => {
      const { base_url: gptBaseUrl, key, use_dify: useDify, model } = req.query;
      // useDify 是 string 类型，需要转换为 boolean 类型
      const dify = useDify === 'true';

      try {
        const { status, message } = await this.messageService.checkApiHealth({
          baseUrl: String(gptBaseUrl),
          apiKey: String(key),
          useDify: dify,
          model: String(model),
        });
        res.json({
          status,
          message,
        });
      } catch (error) {
        console.error(error);
        res.json({
          status: false,
          message: error instanceof Error ? error.message : 'Unknown error',
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
