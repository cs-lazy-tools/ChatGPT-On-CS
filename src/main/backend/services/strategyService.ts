import socketIo from 'socket.io';
import { Platform, StrategyServiceStatusEnum } from '../types';

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

  async updateStatus(status: StrategyServiceStatusEnum): Promise<any> {
    try {
      return await this.emitAndWait('strategyService-updateStatus', { status });
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
        const data = await this.emitAndWait<Platform[]>(
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
