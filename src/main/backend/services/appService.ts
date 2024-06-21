import { Sequelize, Transaction } from 'sequelize';
import { DispatchService } from './dispatchService';
import { Instance } from '../entities/instance';
import { Config } from '../entities/config';
import { Plugin } from '../entities/plugin';

export class AppService {
  private dispatchService: DispatchService;

  private sequelize: Sequelize;

  constructor(dispatchService: DispatchService, sequelize: Sequelize) {
    this.dispatchService = dispatchService;
    this.sequelize = sequelize;
  }

  public async getTasks(): Promise<
    {
      task_id: string;
      env_id: string;
      app_id: string;
    }[]
  > {
    const instances = await Instance.findAll();
    return instances.map((instance) => ({
      task_id: String(instance.id),
      env_id: instance.env_id,
      app_id: instance.app_id,
    }));
  }

  /**
   * 初始化全部任务
   */
  public async initTasks(): Promise<void> {
    const instances = await Instance.findAll();
    await this.dispatchService.updateTasks(instances);
  }

  /**
   * 添加一个任务
   */
  public async addTask(appId: string): Promise<Instance | null> {
    // 使用事务
    return this.sequelize
      .transaction(async (t: Transaction) => {
        const instance = await Instance.create(
          {
            app_id: appId,
            created_at: new Date(),
          },
          { transaction: t },
        );

        // 取得全部 Tasks 然后全部更新
        const tasks = await Instance.findAll();
        tasks.push(instance);
        const result = await this.dispatchService.updateTasks(tasks);
        if (!result || result.length === 0) {
          throw new Error('添加任务失败，请重新尝试');
        }

        // 遍历 result 检查，判断是否存在 error 属性
        const err_target = result.find((task) => task.error);
        if (err_target) {
          throw new Error(err_target.error);
        }

        const target = result.find(
          (task) => task.task_id === String(instance.id),
        );
        if (!target) {
          throw new Error('Failed to find target task');
        }

        instance.env_id = target.env_id;
        await instance.save({ transaction: t });
        return instance;
      })
      .catch((error) => {
        // 处理错误
        console.error('Transaction failed:', error);
        throw error; // 可根据需求自定义错误处理逻辑
      });
  }

  /**
   * 移除一个任务
   */
  public async removeTask(taskId: string): Promise<boolean> {
    const instance = await Instance.findByPk(taskId);

    if (!instance) {
      return false;
    }

    await instance.destroy();

    // 找到对应的 Config 删除
    const config = await Config.findOne({
      where: { instance_id: taskId },
    });
    if (config) {
      // 检查是否使用插件
      if (config.plugin_id) {
        const plugin = await Plugin.findOne({
          where: { id: config.plugin_id },
        });
        if (plugin) {
          await plugin.destroy();
        }
      }

      await config.destroy();
    }

    // 取得全部 Tasks 然后全部更新
    const tasks = await Instance.findAll();
    await this.dispatchService.updateTasks(tasks);

    return true;
  }
}
