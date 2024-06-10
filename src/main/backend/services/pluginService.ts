import * as vm from 'vm';

// 静态导入预加载模块
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { ConfigController } from '../controllers/configController';
import { MessageDTO, ReplyDTO, Context } from '../types';
import { MessageService } from './messageService';

interface PreloadedModules {
  [key: string]: any;
}

// 创建一个包含所有预加载模块的对象
const preloadedModules: PreloadedModules = {
  fs,
  path,
  axios,
};

export class PluginService {
  private configController: ConfigController;

  private messageService: MessageService;

  constructor(
    configController: ConfigController,
    messageService: MessageService,
  ) {
    this.configController = configController;
    this.messageService = messageService;
    preloadedModules.cc = configController;
    preloadedModules.ms = messageService;
  }

  async checkPlugin(
    code: string,
    mockCtx: Context,
    mockMessages: MessageDTO[],
  ): Promise<{
    status: boolean;
    error: string;
    message: string;
  }> {
    try {
      const data = await this.executePluginCode(code, mockCtx, mockMessages);
      return {
        status: true,
        error: '',
        message: data.content,
      };
    } catch (error) {
      return {
        status: false,
        error: error instanceof Error ? error.message : String(error),
        message: 'Plugin execution failed',
      };
    }
  }

  /**
   * 执行插件函数
   * @param plugin_id 插件的ID
   * @param ctx 上下文信息
   * @param messages 消息数组
   * @returns 插件函数的执行结果
   */
  async executePlugin(
    plugin_id: number,
    ctx: Context,
    messages: MessageDTO[],
  ): Promise<ReplyDTO> {
    // 从配置控制器中获取插件配置
    const plugin = await this.configController.getPluginConfig(plugin_id);
    if (!plugin) {
      throw new Error('Plugin not found');
    }

    const cfg = await this.configController.get(ctx);

    // ctx 转成对象
    const ctxObj = Array.from(ctx).reduce((acc: any, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

    // 执行插件代码
    try {
      return await this.executePluginCode(plugin.code, ctxObj, messages);
    } catch (error) {
      return {
        type: 'TEXT',
        content:
          cfg.default_reply || 'An error occurred while executing the plugin',
      };
    }
  }

  private async executePluginCode(
    code: string,
    ctx: Context,
    messages: MessageDTO[],
  ): Promise<ReplyDTO> {
    try {
      // 创建沙盒环境
      const sandbox = {
        module: {} as any,
        exports: {},
        require: (module: string) => {
          // 只允许加载预加载的模块
          if (preloadedModules[module]) {
            return preloadedModules[module];
          }
          throw new Error(`Module ${module} is not available`);
        },
      };

      // 插件代码包装模板，确保插件函数存在并导出
      const pluginCode = `
      ${code}
      module.exports = main;
      `;

      // 创建并运行沙盒上下文
      vm.createContext(sandbox);
      vm.runInContext(pluginCode, sandbox);

      // 检查导出的是否为函数
      if (typeof sandbox.module.exports !== 'function') {
        throw new Error('Plugin does not export a function');
      }

      // 检查是否是异步函数，如果是异步函数则等待执行结果
      let data;
      if (sandbox.module.exports.constructor.name === 'AsyncFunction') {
        data = await sandbox.module.exports(ctx, messages);
      } else {
        data = sandbox.module.exports(ctx, messages);
      }

      // data 的返回类型应该是 ReplyDTO，这里做个数据校验
      if (
        data &&
        typeof data === 'object' &&
        'content' in data &&
        'type' in data
      ) {
        return data as ReplyDTO;
      }

      throw new Error('Plugin function did not return a valid response');
    } catch (error) {
      // 捕获并返回错误信息
      console.error('Plugin execution error:', error);
      throw error;
    }
  }
}

export default PluginService;
