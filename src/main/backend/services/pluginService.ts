import * as vm from 'vm';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as url from 'url';
import * as crypto from 'crypto';
import axios from 'axios';
import { ConfigController } from '../controllers/configController';
import { MessageDTO, ReplyDTO, Context } from '../types';
import { MessageService } from './messageService';
import { LoggerService } from './loggerService';
import { PluginDefaultRunCode } from '../constants';

interface PreloadedModules {
  [key: string]: any;
}

const preloadedModules: PreloadedModules = {
  fs,
  path,
  axios,
  os,
  url,
  crypto,
};

const createSandbox = (contextOverrides: Record<string, any> = {}) => {
  const baseSandbox = {
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
    console,
    module,
    exports,
    ...contextOverrides,
  };

  return baseSandbox;
};

export class PluginService {
  constructor(
    private log: LoggerService,
    private configController: ConfigController,
    private messageService: MessageService,
  ) {
    this.log = log;
    this.configController = configController;
    this.messageService = messageService;

    preloadedModules.config_srv = this.configController;
    preloadedModules.reply_srv = this.messageService;
  }

  async checkPlugin(
    code: string,
    mockCtx: Context,
    mockMessages: MessageDTO[],
  ): Promise<{
    status: boolean;
    error: string;
    message: string;
    consoleOutput: { level: string; time: string; message: string }[];
  }> {
    try {
      const { data, consoleOutput } = await this.executePluginCode(
        code,
        mockCtx,
        mockMessages,
      );

      return {
        status: true,
        error: '',
        message: data.content,
        consoleOutput,
      };
    } catch (error: any) {
      return {
        status: false,
        error: error instanceof Error ? error.message : String(error),
        message: 'Plugin execution failed',
        consoleOutput: error.consoleOutput || [],
      };
    }
  }

  async executePlugin(
    plugin_id: number,
    ctx: Context,
    messages: MessageDTO[],
  ): Promise<ReplyDTO> {
    const plugin = await this.configController.getPluginConfig(plugin_id);
    if (!plugin) {
      // 有可能插件被删除了，这里直接使用默认插件
      this.log.info('使用默认插件');
      const result = await this.executePluginCode(
        PluginDefaultRunCode,
        ctx,
        messages,
      );
      return result.data;
    }

    try {
      const { data } = await this.executePluginCode(plugin.code, ctx, messages);
      return { ...data };
    } catch (error) {
      this.log.error(`插件执行失败: ${error}`);
      throw error;
    }
  }

  async executePluginCode(
    code: string,
    ctx: Context,
    messages: MessageDTO[],
  ): Promise<{
    data: ReplyDTO;
    consoleOutput: { level: string; time: string; message: string }[];
  }> {
    const consoleOutput: { level: string; time: string; message: string }[] =
      [];

    const logMessage = (level: string, ...args: any[]) => {
      const serialize = (obj: any): string => {
        if (typeof obj === 'object' && obj !== null) {
          if (obj instanceof Map) {
            return `Map(${JSON.stringify(Array.from(obj.entries()))})`;
          }
          if (obj instanceof Set) {
            return `Set(${JSON.stringify(Array.from(obj.values()))})`;
          }
          if (obj instanceof Error) {
            return `Error(${obj.name}: ${obj.message})`;
          }
          try {
            return JSON.stringify(obj);
          } catch (error) {
            return '[Unserializable Object]';
          }
        }
        return String(obj);
      };

      const message = args.map((arg) => serialize(arg)).join(' ');

      consoleOutput.push({
        level,
        time: new Date().toISOString(),
        message,
      });
    };

    const customConsole = {
      log: (...args: any[]) => logMessage('log', ...args),
      error: (...args: any[]) => logMessage('error', ...args),
      warn: (...args: any[]) => logMessage('warn', ...args),
      info: (...args: any[]) => logMessage('info', ...args),
    };

    try {
      const sandbox = createSandbox({
        module: {} as any,
        exports: {},
        ctx,
        console: customConsole,
        messages,
        require: (module: string) => {
          console.log('Require:', module);
          if (preloadedModules[module]) {
            return preloadedModules[module];
          }
          throw new Error(`Module ${module} is not available`);
        },
      });

      const pluginCode = `
      ${code}
      module.exports = main;
      `;

      vm.createContext(sandbox);
      vm.runInContext(pluginCode, sandbox);

      if (typeof sandbox.module.exports !== 'function') {
        this.log.error('插件格式错误，请检查是否导出函数');
        throw new Error('Plugin does not export a function');
      }

      if (!messages || messages.length === 0) {
        this.log.error('未提供消息给插件');
        throw new Error('No messages provided to the plugin');
      }

      let data;
      if (sandbox.module.exports[Symbol.toStringTag] === 'AsyncFunction') {
        data = await sandbox.module.exports(ctx, messages);
      } else {
        data = sandbox.module.exports(ctx, messages);
      }

      if (
        data &&
        typeof data === 'object' &&
        'content' in data &&
        'type' in data
      ) {
        console.log('Plugin response:', data);
        console.log('Console output:', consoleOutput);

        return { data: data as ReplyDTO, consoleOutput };
      }

      this.log.error(`未返回有效响应，插件返回数据: ${JSON.stringify(data)}`);
      throw new Error('Plugin function did not return a valid response', data);
    } catch (error: any) {
      console.error('Plugin execution error:', error);
      this.log.error(`运行插件的日志信息: ${JSON.stringify(consoleOutput)}`);
      this.log.error(
        `回复失败: ${error instanceof Error ? error.message : String(error)}`,
      );

      error.consoleOutput = consoleOutput;
      throw error;
    }
  }
}

export default PluginService;
