import socketIo from 'socket.io';
import { ConfigController } from '../controllers/configController';
import { PlatformConfigController } from '../controllers/platformConfigController';
import { Config } from '../entities/config';

export class ConfigService {
  private configController: ConfigController;

  private platformConfigController: PlatformConfigController;

  constructor(
    configController: ConfigController,
    platformConfigController: PlatformConfigController,
  ) {
    this.configController = configController;
    this.platformConfigController = platformConfigController;
  }

  public registerHandlers(socket: socketIo.Socket): void {
    socket.on(
      'configService-getConfigByPlatformId',
      async (data: any, callback) => {
        const { platformId } = data;
        try {
          const config = await this.getConfigByPlatformId(platformId);
          callback(config);
        } catch (error) {
          console.error('Failed to get config', error);
          callback(null);
        }
      },
    );

    socket.on('configService-getConfig', async (arg, callback) => {
      try {
        const config = await this.getConfig();
        callback(config);
      } catch (error) {
        console.error('Failed to get config', error);
        callback(null);
      }
    });
  }

  public async getConfigByPlatformId(platformId: string): Promise<Config> {
    const platformConfig =
      await this.platformConfigController.getByPlatformId(platformId);
    const config = await this.configController.getConfig();
    return { ...config, ...platformConfig };
  }

  public async getConfig(): Promise<Config> {
    return this.configController.getConfig();
  }
}
