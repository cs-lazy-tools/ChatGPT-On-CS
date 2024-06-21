import { create } from 'zustand';

// 定义你的日志对象类型
interface LogObj {
  time: string;
  content: string;
}

// 定义 Store 的状态和方法
interface GlobalStore {
  logs: LogObj[];
  addLog: (log: LogObj) => void;
  clearLogs: () => void;
}

// 创建 Store
const useGlobalStore = create<GlobalStore>((set) => ({
  logs: [], // 初始日志数组为空

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
}));

export default useGlobalStore;
