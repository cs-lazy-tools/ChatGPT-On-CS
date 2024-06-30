import { Config } from '../entities/config';
import { Plugin } from '../entities/plugin';
import {
  Context,
  GenericConfig,
  LLMConfig,
  AccountConfig,
  PluginConfig,
  DriverConfig,
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

    let config;

    // 先查找实例配置
    if (instanceId) {
      config = await Config.findOne({
        where: { platform_id: appId, instance_id: instanceId },
      });

      // 如果实例配置存在且激活，直接返回
      if (config && config.active) {
        return this.mergeWithGlobalConfig(config);
      }
    }

    // 查找应用级别配置
    if (appId) {
      config = await Config.findOne({
        where: { platform_id: appId, instance_id: '' },
      });

      // 如果应用级别配置存在且激活，直接返回
      if (config && config.active) {
        return this.mergeWithGlobalConfig(config);
      }
    }

    // 查找全局配置
    config = await Config.findOne({
      where: { global: true },
    });

    // 如果全局配置不存在，创建一个默认的全局配置
    if (!config) {
      config = await Config.create({
        global: true,
      });
    }

    return this.mergeWithGlobalConfig(config);
  }

  /**
   * 合并全局配置到指定配置
   * @param config 指定的配置
   * @returns 合并后的配置
   */
  private async mergeWithGlobalConfig(config: Config): Promise<Config> {
    const globalConfig = await Config.findOne({
      where: { global: true },
    });

    if (globalConfig) {
      // 合并特定的全局配置项到实例配置
      config.has_keyword_match = globalConfig.has_keyword_match;
      config.has_paused = globalConfig.has_paused;
      config.has_use_gpt = globalConfig.has_use_gpt;
      config.has_mouse_close = globalConfig.has_mouse_close;
      config.has_esc_close = globalConfig.has_esc_close;
    }

    // 检查 key 和 base_url，如果不存在则使用全局配置
    config.llm_type = config.llm_type || globalConfig?.llm_type || 'chatgpt';
    config.model = config.model || globalConfig?.model || 'gpt-3.5-turbo';
    config.key = config.key || globalConfig?.key || '';
    config.base_url = config.base_url || globalConfig?.base_url || '';

    return config;
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
   * 取得自定义插件
   * @param
   * @returns
   */
  public async getAllCustomPlugins(): Promise<Plugin[]> {
    const plugins = await Plugin.findAll();
    return plugins;
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
   * 新增自定义插件
   * @param
   * @returns
   */
  public async createCustomPlugin({
    source,
    author,
    description,
    icon,
    tags,
    title,
    code,
  }: {
    source?: string;
    author?: string;
    description?: string;
    icon?: string;
    tags?: string;
    title: string;
    code: string;
  }) {
    const plugin = await Plugin.create({
      source: source || 'custom',
      author,
      description,
      icon,
      tags,
      type: 'plugin',
      title,
      code,
    });

    return plugin;
  }

  /**
   * 删除自定义插件
   * @param
   * @returns
   */
  public async deleteCustomPlugin(pluginId: number) {
    const plugin = await Plugin.findByPk(pluginId);
    if (plugin) {
      await plugin.destroy();
    }
  }

  /**
   * 更新自定义插件
   * @param
   * @returns
   */
  public async updateCustomPlugin({
    pluginId,
    code,
    description,
    icon,
    tags,
    title,
  }: {
    pluginId: number;
    code: string;
    description: string;
    icon: string;
    tags: string;
    title: string;
  }) {
    const plugin = await Plugin.findByPk(pluginId);
    if (plugin) {
      await plugin.update({
        code,
        description,
        icon,
        tags,
        title,
      });
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
    const config = await this.findConfig(appId, instanceId);
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
    type: 'generic' | 'llm' | 'plugin' | 'driver' | 'account';
  }): Promise<
    | GenericConfig
    | LLMConfig
    | AccountConfig
    | PluginConfig
    | DriverConfig
    | undefined
  > {
    const config = await this.findConfig(appId, instanceId);

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
        truncateWordCount: config?.truncate_word_count || 0,
        truncateWordKey: config?.truncate_word_key || '',
        jinritemaiDefaultReplyMatch:
          config?.jinritemai_default_reply_match || '',
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
      return {
        appId: config?.platform_id || '',
        instanceId: config?.instance_id || '',
        usePlugin: config?.use_plugin || false,
        pluginId: config?.plugin_id || 0,
      };
    }

    if (type === 'driver') {
      return {
        hasPaused: config?.has_paused || false,
        hasKeywordMatch: config?.has_keyword_match || false,
        hasUseGpt: config?.has_use_gpt || false,
        hasMouseClose: config?.has_mouse_close || false,
        hasEscClose: config?.has_esc_close || false,
        hasTransfer: config?.has_transfer || false,
        hasReplace: config?.has_replace || false,
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
    cfg:
      | GenericConfig
      | LLMConfig
      | AccountConfig
      | PluginConfig
      | DriverConfig;
  }) {
    let dbConfig = await this.findConfig(appId, instanceId);
    if (!dbConfig) {
      return;
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
        truncate_word_count: config.truncateWordCount,
        truncate_word_key: config.truncateWordKey,
        jinritemai_default_reply_match: config.jinritemaiDefaultReplyMatch,
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
        pluginId = config.pluginId;
      }

      await dbConfig.update({
        use_plugin: config.usePlugin,
        plugin_id: pluginId,
      });
    } else if (type === 'driver') {
      // TODO: 目前只有全局配置，后续再实现实例配置
      const config = cfg as DriverConfig;
      dbConfig = await Config.findOne({
        where: { global: true },
      });
      if (!dbConfig) {
        throw new Error('Driver config not found');
      }
      await dbConfig.update({
        has_paused: config.hasPaused,
        has_keyword_match: config.hasKeywordMatch,
        has_use_gpt: config.hasUseGpt,
        has_mouse_close: config.hasMouseClose,
        has_esc_close: config.hasEscClose,
        has_transfer: config.hasTransfer,
        has_replace: config.hasReplace,
      });
    } else {
      const config = cfg as AccountConfig;
      await dbConfig.update({
        activation_code: config.activationCode,
      });
    }
  }

  /**
   * 更新配置
   * @param
   */
  public async moveMouseHandler(): Promise<boolean> {
    const dbConfig = await Config.findOne({
      where: { global: true },
    });

    if (!dbConfig) {
      return false;
    }

    // 检查是否开启了鼠标移动自动暂停功能
    if (dbConfig.has_mouse_close) {
      if (!dbConfig.has_paused) {
        await dbConfig.update({
          has_paused: true,
        });

        return true;
      }
    }

    return false;
  }

  public async escKeyDowHandler(): Promise<boolean> {
    const dbConfig = await Config.findOne({
      where: { global: true },
    });

    if (!dbConfig) {
      return false;
    }

    // 检查是否开启了 ESC 键自动暂停功能
    if (dbConfig.has_esc_close) {
      if (!dbConfig.has_paused) {
        await dbConfig.update({
          has_paused: true,
        });

        return true;
      }
    }

    return false;
  }

  /**
   * 查找配置
   * @param appId
   * @param instanceId
   * @returns
   */
  private async findConfig(
    appId: string | undefined,
    instanceId: string | undefined,
  ): Promise<Config | null> {
    let config = null;
    if (instanceId) {
      config = await Config.findOne({
        where: { instance_id: instanceId },
      });

      if (config && config.active) {
        return config;
      }
    }

    if (!config && appId) {
      config = await Config.findOne({
        where: { platform_id: appId },
      });

      if (config && config.active) {
        return config;
      }
    }

    if (!config) {
      config = await Config.findOne({
        where: { global: true },
      });
    }

    return config;
  }
}
