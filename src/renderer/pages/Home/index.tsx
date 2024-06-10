import React, { useEffect } from 'react';
import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Stack,
} from '@chakra-ui/react';
import PageContainer from '../../components/PageContainer';
import ReplyKeyword from './ReplyKeyword';
import { trackPageView } from '../../services/analytics';
import AppManager from './AppManager/index';
import Panels from './Panels';
import LogBox from './LogBox';

const HomePage = () => {
  useEffect(() => {
    // 页面访问埋点
    trackPageView('Home');
  }, []);

  return (
    <PageContainer>
      <ReplyKeyword />
      <Box mb={4}>
        <Tabs>
          <TabList>
            <Tab>应用</Tab>
            <Tab>连接</Tab>
            <Tab>日志</Tab>
          </TabList>

          <TabPanels>
            <TabPanel padding="0">
              <Stack>
                <AppManager />
              </Stack>
            </TabPanel>
            <TabPanel>
              <Panels />
            </TabPanel>
            <TabPanel>
              <LogBox />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      {/* <PlatformTabs /> */}
    </PageContainer>
  );
};

export default HomePage;
