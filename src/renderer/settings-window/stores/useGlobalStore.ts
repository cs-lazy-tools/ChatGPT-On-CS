import { create } from 'zustand';
import { Plugin, LogObj } from '../../common/services/platform/platform';

// 定义 Store 的状态和方法
interface GlobalStore {
  logs: LogObj[];
  addLog: (log: LogObj) => void;
  clearLogs: () => void;
  currentPlugin: Plugin | null;
  setCurrentPlugin: (plugin: Plugin | null) => void;
}

// 创建 Store
const useGlobalStore = create<GlobalStore>((set) => ({
  logs: [], // 初始日志数组为空
  currentPlugin: null, // 初始当前插件为空
  // 添加日志的方法
  addLog: (log) =>
    set((state) => ({
      logs: [...state.logs, log].slice(-50), // 保持日志数组最多 50 条，如果超出则移除最旧的
    })),
  // 清空日志的方法
  clearLogs: () =>
    set(() => ({
      logs: [],
    })),
  // 设置当前插件的方法
  setCurrentPlugin: (plugin) =>
    set(() => ({
      currentPlugin: plugin,
    })),
}));

export default useGlobalStore;
