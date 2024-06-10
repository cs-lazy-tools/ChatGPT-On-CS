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
} from '../../../services/platform/controller';
import defaultPlatformIcon from '../../../../../assets/base/default-platform-icon.png';
import { Instance, App } from '../../../services/platform/platform.d';

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

export const AppManagerProvider = ({ children }: AppManagerProviderProps) => {
  const { data, isLoading } = useQuery(['platformList'], getPlatformList);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null,
  );
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [filteredInstances, setFilteredInstances] = useState<Instance[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    data: taskData,
    refetch: refetchTasks,
    isLoading: isTasksLoadingQuery,
  } = useQuery(['tasks', selectedAppId], () => getTasks(), {
    enabled: !!selectedAppId,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const instances = taskData?.data || [];

  useEffect(() => {
    window.electron.ipcRenderer.on('refresh-config', () => {
      (async () => {
        try {
          await refetchTasks();
        } catch (error: any) {
          console.error(error);
        }
      })();
    });

    return () => {
      window.electron.ipcRenderer.remove('refresh-config');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAppId, instances]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [instances],
  );

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

  const handleAddTask = useCallback(async () => {
    if (selectedAppId) {
      setIsTasksLoading(true);
      const resp = await addTask(selectedAppId);
      console.log('resp', resp);
      await refetchTasks();
      setIsTasksLoading(false);
    }
  }, [selectedAppId, refetchTasks]);

  const contextValue = useMemo(
    () => ({
      data,
      isLoading,
      isTasksLoading: isTasksLoading || isTasksLoadingQuery,
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
      isTasksLoadingQuery,
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
