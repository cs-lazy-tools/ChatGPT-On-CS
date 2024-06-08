import * as vm from 'vm';

// 静态导入预加载模块
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { ConfigController } from '../controllers/configController';
import { MessageDTO, ReplyDTO } from '../types';

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

  constructor(configController: ConfigController) {
    this.configController = configController;
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
    ctx: any,
    messages: MessageDTO[],
  ): Promise<ReplyDTO> {
    // 从配置控制器中获取插件配置
    const plugin = await this.configController.getPluginConfig(plugin_id);
    if (!plugin) {
      throw new Error('Plugin not found');
    }

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

      // =================== 插件代码示例 ===================
      // module.exports = function(ctx, messages) {
      //   do something...
      //   return {
      //     content: 'Hello, world!',
      //     type: 'TEXT',
      //   };
      // };
      // =================== HTTP请求示例 ===================
      // module.exports = async function(ctx, messages) {
      //   const response = await axios.get('https://api.example.com');
      //   return {
      //     content: response.data,
      //     type: 'TEXT',
      //   };
      // };
      // =================== 文件读取示例 ===================
      // module.exports = function(ctx, messages) {
      //   const content = fs.readFileSync('example.txt', 'utf8');
      //   return {
      //     content,
      //     type: 'TEXT',
      //   };
      // };
      // ===================================================

      // 插件代码包装模板，确保插件函数存在并导出
      const pluginCode = `
        const pluginFunction = ${plugin.code};
        if (typeof pluginFunction !== 'function') {
          throw new Error('Plugin function is not defined or not a function');
        }
        module.exports = pluginFunction;
      `;

      // 创建并运行沙盒上下文
      vm.createContext(sandbox);
      vm.runInContext(pluginCode, sandbox);

      // 检查导出的是否为函数
      if (typeof sandbox.module.exports !== 'function') {
        throw new Error('Plugin does not export a function');
      }

      // 执行插件函数并传递 ctx 和 messages
      const data = sandbox.module.exports(ctx, messages);

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
