import { Config } from '../entities/config';
import { Plugin } from '../entities/plugin';

export class ConfigController {
  async getByAppId(appId: string): Promise<Config | null> {
    const config = await Config.findOne({
      where: { platform_id: appId },
    });
    return config;
  }

  async getByInstanceId(instanceId: string): Promise<Config | null> {
    const config = await Config.findOne({
      where: { instance_id: instanceId },
    });
    return config;
  }

  async getGlobalConfig(): Promise<Config> {
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

  async getPluginConfig(pluginId: number): Promise<Plugin | null> {
    const plugin = await Plugin.findByPk(pluginId);
    return plugin;
  }
}
