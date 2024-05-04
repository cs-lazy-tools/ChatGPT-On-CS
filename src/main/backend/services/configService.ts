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

    const { settings } = platformConfig;
    const settingsVal =
      typeof settings === 'string' ? JSON.parse(settings) : settings;
    if (!settingsVal || !settingsVal.active) {
      return this.configController.getConfig();
    }

    const config = await this.configController.getConfig();

    return {
      id: config.id,
      extract_phone: config.extract_phone,
      extract_product: config.extract_product,
      save_path: config.save_path,
      reply_speed: config.reply_speed,
      reply_random_speed: config.reply_random_speed,
      wait_humans_time: config.wait_humans_time,
      context_count: settingsVal.contextCount ?? config.context_count,
      gpt_base_url: settingsVal.proxyAddress ?? config.gpt_base_url,
      gpt_key: settingsVal.apiKey ?? config.gpt_key,
      use_dify: settingsVal.useDify ?? config.use_dify,
      gpt_model: settingsVal.model ?? config.gpt_model,
      default_reply: settingsVal.defaultReply ?? config.default_reply,
      gpt_temperature: config.gpt_temperature,
      gpt_top_p: config.gpt_top_p,
      stream: config.stream,
    } as any;
  }

  public async getConfig(): Promise<Config> {
    return this.configController.getConfig();
  }
}
