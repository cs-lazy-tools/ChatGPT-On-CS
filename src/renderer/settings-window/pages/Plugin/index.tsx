import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Grid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Skeleton,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plugin,
  PluginConfig,
} from '../../../common/services/platform/platform';
import {
  getCustomPluginList as getLocalPluginList,
  getThirdPartyPluginList,
  getConfig,
  updateConfig,
  addCustomPlugin,
} from '../../../common/services/platform/controller';
import PluginCard from './PluginCard';
import { SystemPluginList } from '../../../common/utils/plugins/system';
import useGlobalStore from '../../stores/useGlobalStore';

type PluginPageProps = {
  appId?: string;
  instanceId?: string;
};

const PluginPage = ({ appId, instanceId }: PluginPageProps) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [customPlugins, setCustomPlugins] = useState<Plugin[]>([]);
  const navigate = useNavigate();
  const toast = useToast();
  const { setCurrentPlugin } = useGlobalStore();

  const {
    data: localPluginData,
    isLoading: isLocalLoading,
    refetch: refetchLocalLoading,
  } = useQuery(
    ['localPlugins'],
    () => {
      return getLocalPluginList();
    },
    {
      retry: () => {
        return true;
      },
      retryDelay: () => {
        return 1000;
      },
    },
  );

  const { data: thirdPartyPluginData, isLoading: isThirdPartyLoading } =
    useQuery(
      ['thirdPartyPlugins'],
      () => {
        return getThirdPartyPluginList();
      },
      {
        retry: () => {
          return true;
        },
        retryDelay: () => {
          return 1000;
        },
      },
    );

  const { data: configData, isLoading: isConfigLoading } = useQuery(
    ['config', 'plugin', appId, instanceId],
    async () => {
      try {
        const resp = await getConfig({
          appId,
          instanceId,
          type: 'plugin',
        });
        return resp;
      } catch (error) {
        return null;
      }
    },
    {
      retry: () => {
        return true;
      },
      retryDelay: () => {
        return 1000;
      },
    },
  );

  const [config, setConfig] = useState<PluginConfig | null>(null);

  useEffect(() => {
    if (configData) {
      const obj = configData.data as PluginConfig;
      setConfig(obj);
    }
  }, [configData]);

  useEffect(() => {
    if (localPluginData) {
      setCustomPlugins([
        {
          type: 'custom',
          title: '创建自定义工具',
          description: '',
          tags: [],
        },
        ...localPluginData.data,
      ]);
    }
  }, [localPluginData]);

  if (isLocalLoading || isThirdPartyLoading || isConfigLoading) {
    return (
      <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  const handleActivate = async (plugin: Plugin) => {
    if (!config) return;
    try {
      // 检查一下插件类型，如果是自定义插件，直接激活
      if (plugin.source === 'custom' && plugin.id) {
        // FIXME: 这个 usePlugin 需要独立配置
        const newConfig = { ...config, usePlugin: true, pluginId: plugin.id };
        setConfig(newConfig);
        updateConfig({
          appId,
          instanceId,
          type: 'plugin',
          cfg: newConfig,
        });
      } else {
        // 先复制一份到自定义插件，然后激活
        const newPlugin = {
          ...plugin,
          source: 'custom',
        };

        const resp = await addCustomPlugin(newPlugin);
        if (resp && resp.data && resp.data.id) {
          const newConfig = {
            ...config,
            usePlugin: true,
            pluginId: resp.data.id,
          };
          setConfig(newConfig);
          updateConfig({
            appId,
            instanceId,
            type: 'plugin',
            cfg: newConfig,
          });
        }
      }

      setTabIndex(2);
      await refetchLocalLoading();

      toast({
        title: '激活插件成功',
        position: 'top',
        description: `已经激活 ${plugin.title} 插件`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: '激活插件失败',
        position: 'top',
        description:
          error instanceof Error ? error.message : JSON.stringify(error),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (plugin: Plugin) => {
    if (plugin.type === 'plugin') {
      setCurrentPlugin(plugin);
      navigate('/editor');
    }

    if (plugin.type === 'custom') {
      setCurrentPlugin(null);
      navigate('/editor');
    }
  };

  return (
    <ChakraProvider>
      <Tabs index={tabIndex} onChange={(index) => setTabIndex(index)}>
        <TabList>
          <Tab>系统内置</Tab>
          <Tab>用户分享</Tab>
          <Tab>自定义</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Grid
              templateColumns="repeat(auto-fill, minmax(250px, 1fr))"
              gap={6}
              p={4}
            >
              {SystemPluginList.map((plugin, index) => (
                <PluginCard
                  key={index}
                  plugin={plugin}
                  isActive={false}
                  onActivate={() => handleActivate(plugin)}
                  onEdit={() => handleEdit(plugin)}
                />
              ))}
            </Grid>
          </TabPanel>
          <TabPanel>
            <Grid
              templateColumns="repeat(auto-fill, minmax(250px, 1fr))"
              gap={6}
              p={4}
            >
              {thirdPartyPluginData &&
                thirdPartyPluginData.map((plugin, index) => (
                  <PluginCard
                    key={index}
                    plugin={plugin}
                    isActive={false}
                    onActivate={() => handleActivate(plugin)}
                    onEdit={() => handleEdit(plugin)}
                  />
                ))}
            </Grid>
          </TabPanel>
          <TabPanel>
            <Grid
              templateColumns="repeat(auto-fill, minmax(250px, 1fr))"
              gap={6}
              p={4}
            >
              {customPlugins.map((plugin, index) => (
                <PluginCard
                  key={index}
                  plugin={plugin}
                  isActive={plugin.id === config?.pluginId}
                  onActivate={() => handleActivate(plugin)}
                  onEdit={() => handleEdit(plugin)}
                />
              ))}
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ChakraProvider>
  );
};

export default PluginPage;
