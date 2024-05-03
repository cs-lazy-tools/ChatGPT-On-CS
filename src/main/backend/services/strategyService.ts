import socketIo from 'socket.io';
import { Platform, StrategyServiceStatusEnum } from '../types';
import { ALL_PLATFORMS } from '../constants';

export class StrategyService {
  private io: socketIo.Server;

  constructor(io: socketIo.Server) {
    this.io = io;
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

  public getPlatformInfoById(id: string): Platform | null {
    const platforms = this.getAllPlatforms();
    return platforms.find((platform) => platform.id === id) || null;
  }

  public getAllPlatforms(): Platform[] {
    return ALL_PLATFORMS;
  }
}
