import * as vm from 'vm';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { ConfigController } from '../controllers/configController';
import { MessageDTO, ReplyDTO, Context } from '../types';
import { MessageService } from './messageService';

interface PreloadedModules {
  [key: string]: any;
}

const preloadedModules: PreloadedModules = {
  fs,
  path,
  axios,
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
  private configController: ConfigController;

  constructor(
    configController: ConfigController,
    messageService: MessageService,
  ) {
    this.configController = configController;
    preloadedModules.config_srv = configController;
    preloadedModules.reply_srv = messageService;
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
      throw new Error('Plugin not found');
    }

    const cfg = await this.configController.get(ctx);

    // ctx 转成对象
    const ctxObj = Array.from(ctx).reduce((acc: any, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

    try {
      const { data } = await this.executePluginCode(
        plugin.code,
        ctxObj,
        messages,
      );
      return { ...data };
    } catch (error) {
      console.error('Plugin execution error:', error);
      return {
        type: 'TEXT',
        content:
          cfg.default_reply || 'An error occurred while executing the plugin',
      };
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
        throw new Error('Plugin does not export a function');
      }

      if (!messages || messages.length === 0) {
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

      throw new Error('Plugin function did not return a valid response');
    } catch (error: any) {
      console.error('Plugin execution error:', error);
      error.consoleOutput = consoleOutput;
      throw error;
    }
  }
}

export default PluginService;
