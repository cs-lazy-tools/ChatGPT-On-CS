import { Config } from '../entities/config';
import { Plugin } from '../entities/plugin';
import {
  Context,
  GenericConfig,
  LLMConfig,
  AccountConfig,
  PluginConfig,
} from '../types';
import { CTX_APP_ID, CTX_INSTANCE_ID } from '../constants';

export class ConfigController {
  /**
   * 取得适合当前聊天上下文的配置
   * @param ctx 聊天上下文
   * @returns
   */
  public async get(ctx: Context): Promise<Config> {
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

  /**
   * 激活或关闭配置
   * @param
   * @returns
   */
  public async activeConfig({
    active,
    appId,
    instanceId,
  }: {
    active: boolean;
    appId: string | undefined;
    instanceId: string | undefined;
  }) {
    let config = null;
    if (instanceId) {
      config = await Config.findOne({
        where: { instance_id: instanceId },
      });
      if (!config) {
        config = await Config.create({
          platform_id: appId,
          instance_id: instanceId,
        });
      }
    }

    if (!config && appId) {
      config = await Config.findOne({
        where: { platform_id: appId },
      });
      if (!config) {
        config = await Config.create({
          platform_id: appId,
        });
      }
    }

    if (!config) {
      config = await Config.findOne({
        where: { global: true },
      });
    }

    // 更新配置
    if (config) {
      await config.update({ active });
    }
  }

  /**
   * 检查配置是否激活
   * @param
   * @returns
   */
  public async checkConfigActive({
    appId,
    instanceId,
  }: {
    appId: string | undefined;
    instanceId: string | undefined;
  }): Promise<boolean> {
    let config = null;
    if (instanceId) {
      config = await Config.findOne({
        where: { instance_id: instanceId },
      });

      return config?.active || false;
    }

    if (appId) {
      config = await Config.findOne({
        where: { platform_id: appId },
      });

      return config?.active || false;
    }

    config = await Config.findOne({
      where: { global: true },
    });

    return config?.active || false;
  }

  /**
   * 取得指定类型的配置
   * @param appId
   * @param instanceId
   * @param type
   * @returns
   */
  public async getConfigByType({
    appId,
    instanceId,
    type,
  }: {
    appId: string | undefined;
    instanceId: string | undefined;
    type: string;
  }): Promise<
    GenericConfig | LLMConfig | AccountConfig | PluginConfig | undefined
  > {
    let config = null;
    if (instanceId) {
      config = await Config.findOne({
        where: { instance_id: instanceId },
      });

      if (!config) {
        config = await Config.create({
          platform_id: appId,
          instance_id: instanceId,
        });
      }
    }

    if (!config && appId) {
      config = await Config.findOne({
        where: { platform_id: appId },
      });

      if (!config) {
        config = await Config.create({
          platform_id: appId,
        });
      }
    }

    if (!config) {
      config = await Config.findOne({
        where: { global: true },
      });
    }

    if (type === 'generic') {
      return {
        appId: config?.platform_id || '',
        instanceId: config?.instance_id || '',
        extractPhone: config?.extract_phone || false,
        extractProduct: config?.extract_product || false,
        savePath: config?.save_path || '',
        replySpeed: config?.reply_speed || 0,
        replyRandomSpeed: config?.reply_random_speed || 0,
        contextCount: config?.context_count || 0,
        waitHumansTime: config?.wait_humans_time || 0,
        defaultReply: config?.default_reply || '',
      };
    }
    if (type === 'llm') {
      return {
        appId: config?.platform_id || '',
        instanceId: config?.instance_id || '',
        baseUrl: config?.base_url || '',
        key: config?.key || '',
        llmType: config?.llm_type || 'chatgpt',
        model: config?.model || 'gpt-3.5-turbo',
      };
    }
    if (type === 'plugin') {
      let pluginCode = '';

      if (config?.plugin_id) {
        const plugin = await Plugin.findByPk(config?.plugin_id);
        pluginCode = plugin?.code || '';
      }

      return {
        appId: config?.platform_id || '',
        instanceId: config?.instance_id || '',
        usePlugin: config?.use_plugin || false,
        pluginCode,
      };
    }

    return {
      activationCode: config?.activation_code || '',
    };
  }

  /**
   * 更新配置
   * @param
   */
  public async updateConfigByType({
    appId,
    instanceId,
    type,
    cfg,
  }: {
    appId: string | undefined;
    instanceId: string | undefined;
    type: string;
    cfg: GenericConfig | LLMConfig | AccountConfig | PluginConfig;
  }) {
    let dbConfig = null;
    if (instanceId) {
      dbConfig = await Config.findOne({
        where: { instance_id: instanceId },
      });

      if (!dbConfig) {
        dbConfig = await Config.create({
          platform_id: appId,
          instance_id: instanceId,
        });
      }
    } else if (appId) {
      dbConfig = await Config.findOne({
        where: { platform_id: appId },
      });

      if (!dbConfig) {
        dbConfig = await Config.create({
          platform_id: appId,
        });
      }
    } else {
      dbConfig = await Config.findOne({
        where: { global: true },
      });

      if (!dbConfig) {
        dbConfig = await Config.create({
          global: true,
        });
      }
    }

    if (type === 'generic') {
      const config = cfg as GenericConfig;
      await dbConfig.update({
        extract_phone: config.extractPhone,
        extract_product: config.extractProduct,
        save_path: config.savePath,
        reply_speed: config.replySpeed,
        reply_random_speed: config.replyRandomSpeed,
        context_count: config.contextCount,
        wait_humans_time: config.waitHumansTime,
        default_reply: config.defaultReply,
      });
    } else if (type === 'llm') {
      const config = cfg as LLMConfig;
      await dbConfig.update({
        base_url: config.baseUrl,
        key: config.key,
        llm_type: config.llmType,
        model: config.model,
      });
    } else if (type === 'plugin') {
      let pluginId = null;
      const config = cfg as PluginConfig;
      if (dbConfig.use_plugin) {
        let plugin = await Plugin.findByPk(dbConfig.plugin_id);
        if (!plugin) {
          plugin = await Plugin.create({
            code: config.pluginCode,
          });
        }

        pluginId = plugin.id;
      }

      await dbConfig.update({
        use_plugin: config.usePlugin,
        plugin_id: pluginId,
      });
    } else {
      const config = cfg as AccountConfig;
      await dbConfig.update({
        activation_code: config.activationCode,
      });
    }
  }
}
