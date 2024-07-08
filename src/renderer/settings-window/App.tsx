import React, { useEffect, useState, useCallback } from 'react';
import {
  ChakraProvider,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Checkbox,
  Text,
  Button,
} from '@chakra-ui/react';
import { loader } from '@monaco-editor/react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GeneralSettings from './components/Settings/GeneralSettings';
import LLMSettings from './components/LLMSettings';
import PluginPage from './pages/Plugin';
import PluginEditPage from './pages/PluginEdit';
import AboutPage from './components/About';
import { trackPageView } from '../common/services/analytics';
import {
  checkConfigActive,
  activeConfig,
} from '../common/services/platform/controller';
import theme from '../common/styles/theme';
import '../common/App.css';

// TODO: 后续考虑将 monaco-editor 的路径改为本地路径
loader.config({
  paths: { vs: 'https://jsd.onmicrosoft.cn/npm/monaco-editor@0.43.0/min/vs' },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      retry: false,
      cacheTime: 10,
    },
  },
});

const App = () => {
  const [settings, setSettings] = useState<{
    appId?: string;
    instanceId?: string;
  }>({});
  const toast = useToast();
  const [isActive, setIsActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    trackPageView('Settings');
  }, []);

  // 打印当前的 url
  // console.log('current url:', window.location.href);

  const fetchConfigActive = useCallback(
    async (appId: string, instanceId?: string) => {
      try {
        setIsModalOpen(true);
        const resp = await checkConfigActive({ appId, instanceId });
        setIsActive(resp.data.active);
        if (resp.data.active) {
          setIsModalOpen(false);
        }
      } catch (error) {
        const errormsg =
          error instanceof Error ? error.message : JSON.stringify(error);
        toast({
          title: '获取配置失败',
          description: errormsg,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsActive(false);
      }
    },
    [toast],
  );

  const handleCheckboxChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const { appId, instanceId } = settings;

        console.log('activeConfig', event.target.checked);

        setIsActive(event.target.checked);
        await activeConfig({
          active: event.target.checked,
          appId,
          instanceId,
        });
        toast({
          title: '更新配置成功',
          position: 'top',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        setIsModalOpen(!event.target.checked); // Close modal after activation
      } catch (error) {
        const errormsg =
          error instanceof Error ? error.message : JSON.stringify(error);
        toast({
          title: '更新配置失败',
          description: errormsg,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [settings, toast],
  );

  useEffect(() => {
    const { electron } = window;
    const handleParams = (receivedArgs: string[]) => {
      const settingsArgs = receivedArgs.reduce(
        (acc: { appId?: string; instanceId?: string }, arg: string) => {
          if (arg.startsWith('settings-app-id-')) {
            acc.appId = arg.replace('settings-app-id-', '');
          }
          if (arg.startsWith('settings-instance-id-')) {
            acc.instanceId = arg.replace('settings-instance-id-', '');
          }
          return acc;
        },
        {},
      );

      setSettings(settingsArgs);

      // If both appId and instanceId are present, fetch config active state
      if (settingsArgs.appId) {
        fetchConfigActive(settingsArgs.appId, settingsArgs.instanceId);
      }
    };

    if (electron) {
      const receivedArgs = electron.getArgs();
      handleParams(receivedArgs);

      electron.ipcRenderer.on(
        'update-settings-params',
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-shadow
        (receivedArgs: string[]) => {
          console.log('update-settings-params', receivedArgs);
          handleParams(receivedArgs);
        },
      );
    }

    return () => {
      window.electron.ipcRenderer.remove('update-settings-params');
    };
  }, [fetchConfigActive]);

  const renderSettingsTabs = () => (
    <Tabs variant="enclosed" orientation="vertical" flex="1">
      <TabList
        p={4}
        width="200px"
        bg="gray.100"
        borderRight="1px solid"
        borderColor="gray.200"
      >
        <Tab
          _selected={{ bg: 'gray.200' }}
          _hover={{ bg: 'gray.300' }}
          textAlign="left"
        >
          通用设置
        </Tab>
        <Tab
          _selected={{ bg: 'gray.200' }}
          _hover={{ bg: 'gray.300' }}
          textAlign="left"
        >
          AI 配置
        </Tab>
        <Tab
          _selected={{ bg: 'gray.200' }}
          _hover={{ bg: 'gray.300' }}
          textAlign="left"
        >
          {settings.appId || settings.instanceId ? '' : '全局'}插件设置
        </Tab>

        {!settings.appId && (
          <Tab
            _selected={{ bg: 'gray.200' }}
            _hover={{ bg: 'gray.300' }}
            textAlign="left"
          >
            关于
          </Tab>
        )}
      </TabList>

      <TabPanels flex="1" overflowY="auto" p={4}>
        <TabPanel>
          <Heading as="h3" size="md" mb={4}>
            通用设置
          </Heading>
          <GeneralSettings
            style={{ width: '60vw' }}
            appId={settings.appId}
            instanceId={settings.instanceId}
          />
        </TabPanel>
        <TabPanel>
          <Heading as="h3" size="md" mb={4}>
            AI 配置
          </Heading>
          <LLMSettings
            appId={settings.appId}
            instanceId={settings.instanceId}
          />
        </TabPanel>
        <TabPanel>
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <PluginPage
                    appId={settings.appId}
                    instanceId={settings.instanceId}
                  />
                }
              />
              <Route path="/editor" element={<PluginEditPage />} />
            </Routes>
          </Router>
        </TabPanel>

        {!settings.appId && (
          <>
            <TabPanel>
              <AboutPage />
            </TabPanel>
          </>
        )}
      </TabPanels>
    </Tabs>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Flex direction="row" height="99vh">
          {renderSettingsTabs()}
        </Flex>

        {settings.appId && (
          <Modal isOpen={isModalOpen} onClose={() => {}}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                设置
                <Checkbox
                  ml={4}
                  isChecked={isActive}
                  onChange={handleCheckboxChange}
                >
                  激活{' '}
                  {settings.instanceId
                    ? `客服 ${settings.instanceId} 设置`
                    : `应用 ${settings.appId} 设置`}
                </Checkbox>
                <Text color="gray.500" fontSize="sm">
                  请注意：激活设置后，设置才会生效
                </Text>
              </ModalHeader>
              <ModalBody>{/* 具体内容可在这里添加 */}</ModalBody>
            </ModalContent>
          </Modal>
        )}

        {settings.appId && isActive && (
          <Button
            position="fixed"
            top="16px"
            right="16px"
            colorScheme="red"
            onClick={() => {
              // @ts-ignore
              handleCheckboxChange({ target: { checked: false } });
            }}
          >
            取消激活
          </Button>
        )}
      </ChakraProvider>
    </QueryClientProvider>
  );
};

export default React.memo(App);
