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
    if (!settings || !settings.active) {
      return this.configController.getConfig();
    }

    const config = await this.configController.getConfig();

    return {
      id: config.id,
      extract_phone: settings.extract_phone ?? config.extract_phone,
      extract_product: settings.extract_product ?? config.extract_product,
      save_path: settings.save_path ?? config.save_path,
      reply_speed: settings.reply_speed ?? config.reply_speed,
      reply_random_speed:
        settings.reply_random_speed ?? config.reply_random_speed,
      context_count: settings.context_count ?? config.context_count,
      wait_humans_time: settings.wait_humans_time ?? config.wait_humans_time,
      gpt_base_url: settings.gpt_base_url ?? config.gpt_base_url,
      gpt_key: settings.gpt_key ?? config.gpt_key,
      use_dify: settings.use_dify ?? config.use_dify,
      gpt_model: settings.gpt_model ?? config.gpt_model,
      gpt_temperature: settings.gpt_temperature ?? config.gpt_temperature,
      gpt_top_p: settings.gpt_top_p ?? config.gpt_top_p,
      stream: settings.stream ?? config.stream,
      default_reply: settings.default_reply ?? config.default_reply,
    } as any;
  }

  public async getConfig(): Promise<Config> {
    return this.configController.getConfig();
  }
}
