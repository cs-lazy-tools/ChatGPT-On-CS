import React, {
  useMemo,
  useCallback,
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getPlatformList,
  getTasks,
  removeTask,
  addTask,
} from '../../../common/services/platform/controller';
import defaultPlatformIcon from '../../../../../assets/base/default-platform-icon.png';
import { Instance, App } from '../../../common/services/platform/platform';

interface AppManagerContextType {
  data: { data: App[] } | undefined;
  isLoading: boolean;
  isTasksLoading: boolean;
  setSelectedAppId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedAppId: string | null;
  setSelectedInstanceId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedInstanceId: string | null;
  filteredInstances: Instance[];
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSearch: (searchTerm: string) => void;
  handleDelete: (taskId: string) => void;
  handleAddTask: () => void;
  instances: Instance[];
}

const AppManagerContext = createContext<AppManagerContextType | undefined>(
  undefined,
);

interface AppManagerProviderProps {
  children: ReactNode;
}

export const useAppManager = (): AppManagerContextType => {
  const context = useContext(AppManagerContext);
  if (!context) {
    throw new Error('useAppManager must be used within an AppManagerProvider');
  }
  return context;
};

const usePlatformList = () => {
  const [retryCount, setRetryCount] = useState(0);

  const { data, error, refetch, isLoading } = useQuery(
    ['platformList'],
    getPlatformList,
    {
      retry: false, // 禁用 react-query 内置的重试机制
    },
  );

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if ((data?.data?.length === 0 || !data) && retryCount < 20) {
      const timer = setTimeout(() => {
        setRetryCount(retryCount + 1);
        refetch();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [data, retryCount, refetch]);

  return { data, isLoading, error, retryCount };
};

const useTaskList = () => {
  return useQuery(['tasks'], () => getTasks());
};

/**
 * 返回全部应用的全部实例
 */
const useInstances = () => {
  const { data: taskData, refetch: refetchTasks } = useTaskList();
  const instances = taskData?.data || [];

  return { instances, refetchTasks };
};

/**
 * 返回当前选择的应用下的实例
 */
const useFilteredInstances = (
  data: { data: App[] } | undefined,
  instances: Instance[],
  selectedAppId: string | null,
) => {
  const [filteredInstances, setFilteredInstances] = useState<Instance[]>([]);

  useEffect(() => {
    if (selectedAppId && data) {
      const matchedInstances = instances.filter(
        (instance) => instance.app_id === selectedAppId,
      );
      const updatedInstances = matchedInstances.map((instance) => ({
        ...instance,
        avatar:
          data.data.find((app) => app.id === instance.app_id)?.avatar ||
          defaultPlatformIcon,
      }));
      setFilteredInstances(updatedInstances);
    } else {
      setFilteredInstances([]);
    }
  }, [selectedAppId, instances, data]);

  return { filteredInstances, setFilteredInstances };
};

/**
 * 监听刷新配置事件，避免因为重启导致的配置不同步
 */
const useRefreshConfigListener = (refetchTasks: () => void) => {
  useEffect(() => {
    const refreshConfigListener = async () => {
      try {
        await refetchTasks();
      } catch (error: any) {
        console.error(error);
      }
    };

    window.electron.ipcRenderer.on('refresh-config', refreshConfigListener);
    return () => {
      window.electron.ipcRenderer.remove('refresh-config');
    };
  }, [refetchTasks]);
};

export const AppManagerProvider = ({ children }: AppManagerProviderProps) => {
  const { data, isLoading } = usePlatformList();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null,
  );
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { instances, refetchTasks } = useInstances();

  useRefreshConfigListener(refetchTasks);

  const { filteredInstances, setFilteredInstances } = useFilteredInstances(
    data,
    instances,
    selectedAppId,
  );

  /**
   * 根据应用名称搜索实例
   */
  const handleSearch = useCallback(
    (searchTerm: string) => {
      if (data) {
        const matchedInstances = instances.filter((instance) => {
          const app = data.data.find((x) => x.id === instance.app_id);
          return app?.name.includes(searchTerm);
        });
        const updatedInstances = matchedInstances.map((instance) => ({
          ...instance,
          avatar:
            data.data.find((app) => app.id === instance.app_id)?.avatar ||
            defaultPlatformIcon,
        }));
        setFilteredInstances(updatedInstances);
      }
    },
    [data, instances, setFilteredInstances],
  );

  /**
   * 删除任务
   */
  const handleDelete = useCallback(
    async (taskId: string) => {
      try {
        await removeTask(taskId);
        refetchTasks();
      } catch (error) {
        console.error('删除失败:', (error as Error).message || '未知错误');
      }
    },
    [refetchTasks],
  );

  /**
   * 添加任务
   */
  const handleAddTask = useCallback(async () => {
    if (selectedAppId) {
      setIsTasksLoading(true);
      try {
        const { error } = await addTask(selectedAppId);
        if (error) {
          throw new Error(error);
        }

        await refetchTasks();
      } finally {
        setIsTasksLoading(false);
      }
    }
  }, [selectedAppId, refetchTasks]);

  const contextValue = useMemo(
    () => ({
      data,
      isLoading,
      isTasksLoading,
      selectedAppId,
      setSelectedAppId,
      selectedInstanceId,
      setSelectedInstanceId,
      filteredInstances,
      isSettingsOpen,
      setIsSettingsOpen,
      handleSearch,
      handleDelete,
      handleAddTask,
      instances,
    }),
    [
      data,
      isLoading,
      isTasksLoading,
      selectedAppId,
      selectedInstanceId,
      filteredInstances,
      isSettingsOpen,
      instances,
      handleSearch,
      handleDelete,
      handleAddTask,
    ],
  );

  return (
    <AppManagerContext.Provider value={contextValue}>
      {children}
    </AppManagerContext.Provider>
  );
};
