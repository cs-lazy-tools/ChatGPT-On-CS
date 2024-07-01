import React, { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Box,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Th,
  Tr,
  Td,
  Divider,
  Text,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { FiPlay } from 'react-icons/fi';
import { checkPluginAvailability } from '../../../common/services/platform/controller';
import { useSystemStore } from '../../stores/useSystemStore';
import {
  Message,
  RoleType,
  MessageType,
  LogBody,
} from '../../../common/services/platform/platform';
import {
  ContextKeys,
  MockCtx,
  MockMessages,
} from '../../../common/utils/constants';

const PluginTestPage = ({ code }: { code?: string }) => {
  const toast = useToast();
  const [consoleLogs, setConsoleLogs] = useState<LogBody[]>([]);
  const [hasRuning, setHasRuning] = useState(false);
  const [newMessage, setNewMessage] = useState<Message>({
    sender: '',
    content: '',
    role: 'SELF',
    type: 'TEXT',
  });
  const [selectedContextKey, setSelectedContextKey] = useState<string>(
    ContextKeys[0],
  );
  const [contextValue, setContextValue] = useState<string>('');
  const {
    context,
    setContext,
    clearContext,
    addMessage,
    messages,
    removeMessage,
  } = useSystemStore();

  const handleAddMessage = () => {
    addMessage(newMessage);
    setNewMessage({ sender: '', content: '', role: 'SELF', type: 'TEXT' });
  };

  const handleSetContext = () => {
    setContext(selectedContextKey, contextValue);
    setContextValue('');
  };

  const handleCheckPlugin = async () => {
    try {
      setHasRuning(true);
      const resp = await checkPluginAvailability({
        code: code || '',
        ctx: context,
        messages,
      });
      setConsoleLogs(resp.consoleOutput || []);
      if (resp.status && resp.message) {
        toast({
          title: '插件测试通过',
          position: 'top',
          description: resp.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        let error_msg = '未知错误';
        if (resp.error) {
          error_msg = resp.error;
        } else if (!resp.message) {
          error_msg = '回复消息为空';
        }

        toast({
          title: '插件测试失败',
          position: 'top',
          description: error_msg,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: '检查插件失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setHasRuning(false);
    }
  };

  const handleSetDefault = () => {
    // MockCtx 是一个 Map 对象
    clearContext();

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of MockCtx) {
      setContext(key, value);
    }

    // 先清空所有消息
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      removeMessage(i);
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const msg of MockMessages) {
      // @ts-ignore
      addMessage(msg);
    }
  };

  return (
    <VStack spacing="4" align="start" width="100%">
      <HStack>
        <Button
          leftIcon={<FiPlay />}
          onClick={handleCheckPlugin}
          colorScheme="green"
          size="sm"
          isLoading={hasRuning}
        >
          测试插件
        </Button>
        <Button leftIcon={<RepeatIcon />} onClick={handleSetDefault} size="sm">
          设置默认
        </Button>
      </HStack>

      <Flex width="100%" justifyContent="space-between">
        <Box width="48%">
          <FormControl>
            <FormLabel>测试上下文</FormLabel>
            <Select
              value={selectedContextKey}
              onChange={(e) => setSelectedContextKey(e.target.value)}
            >
              {ContextKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>上下文的输入值</FormLabel>
            <Input
              value={contextValue}
              onChange={(e) => setContextValue(e.target.value)}
            />
          </FormControl>
          <Button
            mt={4}
            onClick={handleSetContext}
            colorScheme="blue"
            size="sm"
          >
            设置上下文内容
          </Button>
          <Divider my={4} />
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>上下文主键</Th>
                <Th>上下文的值</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.entries(context).map(([key, value], index) => (
                <Tr key={index}>
                  <Td>{key}</Td>
                  <Td>{value}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box width="48%">
          <FormControl>
            <FormLabel>发送者</FormLabel>
            <Input
              value={newMessage.sender}
              onChange={(e) =>
                setNewMessage({ ...newMessage, sender: e.target.value })
              }
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>消息内容</FormLabel>
            <Input
              value={newMessage.content}
              onChange={(e) =>
                setNewMessage({ ...newMessage, content: e.target.value })
              }
            />
          </FormControl>
          <HStack mt={4}>
            <FormControl>
              <FormLabel>Role</FormLabel>
              <Select
                value={newMessage.role}
                onChange={(e) =>
                  setNewMessage({
                    ...newMessage,
                    role: e.target.value as RoleType,
                  })
                }
              >
                <option value="SELF">自己的消息</option>
                <option value="OTHER">别人的消息</option>
                <option value="SYSTEM">系统消息</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>消息类型</FormLabel>
              <Select
                value={newMessage.type}
                onChange={(e) =>
                  setNewMessage({
                    ...newMessage,
                    type: e.target.value as MessageType,
                  })
                }
              >
                <option value="TEXT">文本</option>
                <option value="IMAGE">图片</option>
                <option value="VIDEO">视频</option>
                <option value="FILE">文件</option>
              </Select>
            </FormControl>
          </HStack>
          <Button
            mt={4}
            onClick={handleAddMessage}
            colorScheme="blue"
            size="sm"
          >
            添加消息
          </Button>
          <Divider my={4} />
          <Box>
            {messages.map((msg, index) => (
              <HStack
                key={index}
                justify="space-between"
                mb={2}
                bg={msg.role === 'SELF' ? 'blue.100' : 'gray.100'}
                p={2}
                borderRadius="md"
              >
                <Box>
                  <Text fontSize="sm" fontWeight="bold">
                    {msg.sender}
                  </Text>
                  <Text fontSize="sm">{msg.content}</Text>
                  <Text fontSize="xs" color="gray.500">
                    ({msg.role} - {msg.type})
                  </Text>
                </Box>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => removeMessage(index)}
                >
                  删除
                </Button>
              </HStack>
            ))}
          </Box>
        </Box>
      </Flex>

      <Divider />
      <Box width="100%">
        <HStack justify="space-between">
          <Text fontWeight="bold">查看日志</Text>
          <Button
            onClick={() => setConsoleLogs([])}
            colorScheme="red"
            size="sm"
          >
            清空日志
          </Button>
        </HStack>
        {consoleLogs && consoleLogs.length > 0 && (
          <Box height="200px" overflowY="auto" mt={2}>
            {consoleLogs.map((log, index) => (
              <Text key={index}>
                {log.level} {log.time} {log.message}
              </Text>
            ))}
          </Box>
        )}
      </Box>
    </VStack>
  );
};

export default PluginTestPage;
