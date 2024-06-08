import React, { useState } from 'react';
import {
  ChakraProvider,
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Container,
  Button,
} from '@chakra-ui/react';

const SettingsPage = () => {
  return (
    <ChakraProvider>
      <Flex direction="column" height="100vh">
        {/* 顶部 Tab 栏 */}
        <Tabs variant="enclosed" isFitted>
          <TabList>
            <Tab>通用设置</Tab>
            <Tab>AI 配置</Tab>
            <Tab>使用激活码</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <AccountSettings />
            </TabPanel>
            <TabPanel>
              <NotificationsSettings />
            </TabPanel>
            <TabPanel>
              <PrivacySettings />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* 设置项内容区域 */}
        <Box flex="1" p="4">
          <Container maxW="container.md">
            <Text fontSize="2xl" mb="4">
              Settings
            </Text>
          </Container>
        </Box>

        {/* 固定保存按钮 */}
        <Box
          position="fixed"
          bottom="0"
          left="0"
          width="100%"
          p="4"
          bg="gray.100"
          borderTop="1px solid #ccc"
        >
          <HStack justify="flex-end">
            <Button colorScheme="teal">Save</Button>
          </HStack>
        </Box>
      </Flex>
    </ChakraProvider>
  );
};

const AccountSettings = () => (
  <VStack spacing="4" align="start">
    <Text>Account Settings</Text>
    {/* 添加具体的账户设置表单 */}
  </VStack>
);

const NotificationsSettings = () => (
  <VStack spacing="4" align="start">
    <Text>Notifications Settings</Text>
    {/* 添加具体的通知设置表单 */}
  </VStack>
);

const PrivacySettings = () => (
  <VStack spacing="4" align="start">
    <Text>Privacy Settings</Text>
    {/* 添加具体的隐私设置表单 */}
  </VStack>
);

export default React.memo(SettingsPage);
