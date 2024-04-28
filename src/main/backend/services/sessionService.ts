import socketIo from 'socket.io';
import { SessionController } from '../controllers/sessionController';
import { Session } from '../entities/session';
import { StrategyService } from './strategyService';

export class SessionService {
  private sessionController: SessionController;

  private strategyService: StrategyService;

  constructor(
    sessionController: SessionController,
    strategyService: StrategyService,
  ) {
    this.sessionController = sessionController;
    this.strategyService = strategyService;
  }

  public registerHandlers(socket: socketIo.Socket): void {
    socket.on('sessionService-getSession', async (data: any, callback) => {
      const { platformId, username, goodsName, goodsAvatar } = data;

      const ptf = this.strategyService.getPlatformInfoById(platformId);
      const startTime = new Date().getTime();
      try {
        if (!username) {
          // 直接新建一个 session
          const session = await this.createSession(
            platformId,
            ptf?.name || '',
            goodsName,
            goodsAvatar,
          );

          callback(session);
          return;
        }

        const session = await this.getSessionOrCreate(
          platformId,
          username,
          goodsName,
          goodsAvatar,
        );
        callback(session);
      } catch (error) {
        console.error('Failed to get session', error);
        callback(null);
      } finally {
        console.log('getSession time:', new Date().getTime() - startTime, 'ms');
      }
    });
  }

  public async createSession(
    platformId: string,
    platformName: string,
    goodsName?: string,
    goodsAvatar?: string,
  ): Promise<Session> {
    return this.sessionController.create({
      platform_id: platformId,
      platform: platformName,
      username: '',
      last_active: new Date(),
      goods_name: goodsName || '',
      goods_avatar: goodsAvatar || '',
      created_at: new Date(),
    });
  }

  public async getSessionOrCreate(
    platformId: string,
    username: string,
    goodsName?: string,
    goodsAvatar?: string,
  ): Promise<Session> {
    const sessions = await this.sessionController.search(platformId, username);
    if (sessions.length > 0) {
      const session = sessions[0];
      session.last_active = new Date();
      if (goodsName && goodsAvatar) {
        session.goods_name = goodsName;
        session.goods_avatar = goodsAvatar;
      }
      return this.sessionController.update(session.id, session);
    }

    const ptf = this.strategyService.getPlatformInfoById(platformId);

    return this.sessionController.create({
      platform_id: platformId,
      platform: ptf?.name || '',
      username,
      last_active: new Date(),
      goods_name: goodsName || '',
      goods_avatar: goodsAvatar || '',
      created_at: new Date(),
    });
  }
}
