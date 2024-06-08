import { Config } from '../entities/config';
import { Plugin } from '../entities/plugin';
import { CTX_APP_ID, CTX_INSTANCE_ID } from '../constants';

export class ConfigController {
  /**
   * 取得适合当前聊天上下文的配置
   * @param ctx 聊天上下文
   * @returns
   */
  public async get(ctx: any): Promise<Config> {
    const appId = ctx.get(CTX_APP_ID);
    const instanceId = ctx.get(CTX_INSTANCE_ID);

    const instanceConfig = await Config.findOne({
      where: { instance_id: instanceId },
    });
    if (instanceConfig) {
      return instanceConfig;
    }

    const appConfig = await Config.findOne({
      where: { platform_id: appId },
    });
    if (appConfig) {
      return appConfig;
    }

    let config = await Config.findOne({
      where: { global: true },
    });

    if (!config) {
      config = await Config.create({
        global: true,
      });
    }

    return config;
  }

  /**
   * 取得插件配置
   * @param pluginId
   * @returns
   */
  public async getPluginConfig(pluginId: number): Promise<Plugin | null> {
    const plugin = await Plugin.findByPk(pluginId);
    return plugin;
  }
}
