import React from 'react';
import {
  ChakraProvider,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
} from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReplyKeyword from './components/ReplyKeyword';
import SessionHistory from './components/SessionHistory';
import ReplaceKeyword from './components/ReplaceKeyword';
import TransferKeyword from './components/TransferKeyword';
import theme from '../common/styles/theme';
import '../common/App.css';

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
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Flex direction="row" height="99vh">
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
                编辑关键词
              </Tab>

              <Tab
                _selected={{ bg: 'gray.200' }}
                _hover={{ bg: 'gray.300' }}
                textAlign="left"
              >
                替换关键词
              </Tab>
              <Tab
                _selected={{ bg: 'gray.200' }}
                _hover={{ bg: 'gray.300' }}
                textAlign="left"
              >
                转人工关键词
              </Tab>
              <Tab
                _selected={{ bg: 'gray.200' }}
                _hover={{ bg: 'gray.300' }}
                textAlign="left"
              >
                历史聊天记录
              </Tab>
            </TabList>
            <TabPanels flex="1" overflowY="auto" p={4}>
              <TabPanel>
                <Heading as="h3" size="md" mb={4}>
                  关键词匹配
                </Heading>
                <ReplyKeyword />
              </TabPanel>

              <TabPanel>
                <Heading as="h3" size="md" mb={4}>
                  替换关键词
                </Heading>
                <ReplaceKeyword />
              </TabPanel>
              <TabPanel>
                <Heading as="h3" size="md" mb={4}>
                  转人工关键词
                </Heading>
                <TransferKeyword />
              </TabPanel>
              <TabPanel>
                <Heading as="h3" size="md" mb={4}>
                  历史聊天记录
                </Heading>
                <SessionHistory />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
      </ChakraProvider>
    </QueryClientProvider>
  );
};

export default React.memo(App);
