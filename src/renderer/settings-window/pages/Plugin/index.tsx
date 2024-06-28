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
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plugin } from '../../../common/services/platform/platform';
import { getCustomPluginList as getLocalPluginList } from '../../../common/services/platform/controller';
import PluginCard from './PluginCard';

const systemPlugins = [
  {
    type: 'guide',
    title: '我有兴趣为懒人客服\n贡献工具',
    description: '',
    tags: [],
    icon: '📘',
  },
  {
    type: 'plugin',
    title: '系统插件名称',
    author: '系统作者名',
    description: '这是一个系统插件的描述。',
    tags: ['Tag1', 'Tag2', 'Tag3'],
    icon: '😀',
  },
  // 其他系统插件数据...
];

const userPlugins = [
  {
    type: 'plugin',
    title: '用户插件名称',
    author: '用户作者名',
    description: '这是一个用户插件的描述。',
    tags: ['Tag1', 'Tag2', 'Tag3'],
    icon: '😀',
  },
  // 其他用户插件数据...
];

type PluginPageProps = {
  appId?: string;
  instanceId?: string;
};

const PluginPage = ({ appId, instanceId }: PluginPageProps) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [activePlugin, setActivePlugin] = useState<number | null>(null);
  const [customPlugins, setCustomPlugins] = useState<Plugin[]>([]);
  const navigate = useNavigate();

  const {
    data: localPluginData,
    isLoading: isLocalLoading,
    // refetch: refetchLocalPluginList,
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

  useEffect(() => {
    if (localPluginData) {
      console.log(localPluginData);
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

  if (isLocalLoading) {
    return (
      <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  const handleActivate = (index: number) => {
    setActivePlugin(activePlugin === index ? null : index);
  };

  const handleEdit = (plugin: Plugin) => {
    console.log('edit', plugin);
    if (plugin.type === 'custom' || plugin.type === 'plugin') {
      navigate(
        '/settings.html/editor',
        plugin.id
          ? {
              state: { pluginId: plugin.id },
            }
          : {},
      );
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
              {systemPlugins.map((plugin, index) => (
                <PluginCard
                  key={index}
                  plugin={plugin}
                  isActive={activePlugin === index}
                  onActivate={() => handleActivate(index)}
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
              {userPlugins.map((plugin, index) => (
                <PluginCard
                  key={index}
                  plugin={plugin}
                  isActive={activePlugin === index}
                  onActivate={() => handleActivate(index)}
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
                  isActive={activePlugin === index}
                  onActivate={() => handleActivate(index)}
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
