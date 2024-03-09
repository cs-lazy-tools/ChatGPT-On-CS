import React, { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import PageContainer from '../../components/PageContainer';
import PlatformTabs from './PlatformTabs';
import DriverSettings from './DriverSettings';
import ReplyKeyword from './ReplyKeyword';
import analytics from '../../services/analytics/index_template';

const HomePage = () => {
  useEffect(() => {
    // 页面访问埋点
    analytics.onEvent('$PageView', {
      $PageName: 'home',
    });
  }, []);

  return (
    <PageContainer>
      <ReplyKeyword />
      <Box mb={4}>
        <DriverSettings />
      </Box>
      <PlatformTabs />
    </PageContainer>
  );
};

export default HomePage;
