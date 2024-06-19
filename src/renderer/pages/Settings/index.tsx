import React, { useEffect } from 'react';
import {
  ChakraProvider,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import AccountSettings from '../../components/Settings/AccountSettings';
import GeneralSettings from '../../components/Settings/GeneralSettings';
import LLMSettings from '../../components/Settings/LLMSettings';
import PluginSettings from '../../components/Settings/PluginSettings';
import { trackPageView } from '../../services/analytics';

const SettingsPage = () => {
  useEffect(() => {
    trackPageView('Settings');
  }, []);

  return (
    <ChakraProvider>
      <Flex direction="column" height="70vh">
        {/* 顶部 Tab 栏 */}
        <Tabs variant="enclosed" isFitted>
          <TabList>
            <Tab>通用设置</Tab>
            <Tab>AI 配置</Tab>
            <Tab>全局插件设置</Tab>
            <Tab>使用激活码</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <GeneralSettings />
            </TabPanel>
            <TabPanel>
              <LLMSettings />
            </TabPanel>
            <TabPanel>
              <PluginSettings />
            </TabPanel>
            <TabPanel>
              <AccountSettings />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </ChakraProvider>
  );
};

export default React.memo(SettingsPage);
