import socketIo from 'socket.io';
import { Platform, StrategyServiceStatusEnum } from '../types';
import { ALL_PLATFORMS } from '../constants';

export class StrategyService {
  private io: socketIo.Server;

  private platformInfo: Platform[];

  constructor(io: socketIo.Server) {
    this.io = io;
    this.platformInfo = [];
  }

  async emitAndWait<T>(
    event: string,
    data?: any,
    timeout: number = 5000,
  ): Promise<T> {
    let response;
    if (data === undefined) {
      response = await this.io.timeout(timeout).emitWithAck(event);
    } else {
      response = await this.io.timeout(timeout).emitWithAck(event, data);
    }

    // 判断是否是 Array
    if (Array.isArray(response) && response.length === 1) {
      if (typeof response[0] === 'undefined') {
        return {} as T;
      }

      if (response[0] === 'string') {
        return {} as T;
      }

      // 如果 response[0] 也是数组，那么直接返回
      if (Array.isArray(response[0])) {
        return response[0] as T;
      }

      return JSON.parse(response[0]);
    }

    // 判断是否是字符串
    if (typeof response === 'string') {
      return JSON.parse(response);
    }

    return response;
  }

  async updateStrategies(ids: string[]): Promise<any> {
    try {
      return await this.emitAndWait('strategyService-updateStrategies', {
        ids,
      });
    } catch (error) {
      console.error('Failed to update strategies', error);
      return null;
    }
  }

  async updateStatus(status: StrategyServiceStatusEnum): Promise<any> {
    try {
      return await this.emitAndWait('strategyService-updateStatus', { status });
    } catch (error) {
      console.error('Failed to update status', error);
      return null;
    }
  }

  public async getPlatformInfoById(id: string): Promise<Platform | null> {
    const platforms = await this.getAllPlatforms();
    return platforms.find((platform) => platform.id === id) || null;
  }

  public async getAllPlatforms(): Promise<Platform[]> {
    if (this.platformInfo.length > 0) {
      return this.platformInfo;
    }

    try {
      const data = await this.emitAndWait<Platform[]>(
        'strategyService-getAllPlatforms',
      );
      return data.length > 0 ? data : ALL_PLATFORMS;
    } catch (error) {
      console.error('Failed to update strategies', error);
      return ALL_PLATFORMS;
    }
  }
}
