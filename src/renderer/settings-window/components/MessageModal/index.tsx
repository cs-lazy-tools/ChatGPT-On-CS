import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
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
} from '@chakra-ui/react';
import { useSystemStore } from '../../stores/useSystemStore';
import {
  Message,
  RoleType,
  MessageType,
} from '../../../common/services/platform/platform';
import {
  ContextKeys,
  MockCtx,
  MockMessages,
} from '../../../common/utils/constants';

type MessageModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MessageModal = ({ isOpen, onClose }: MessageModalProps) => {
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
  const { context, setContext, addMessage, messages, removeMessage } =
    useSystemStore();

  const handleAddMessage = () => {
    addMessage(newMessage);
    setNewMessage({ sender: '', content: '', role: 'SELF', type: 'TEXT' });
  };

  const handleSetContext = () => {
    setContext(selectedContextKey, contextValue);
    setContextValue('');
  };

  const handleSetDefault = () => {
    // MockCtx 是一个 Map 对象
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          配置测试用的聊天记录
          <Button
            onClick={handleSetDefault}
            colorScheme="orange"
            size="sm"
            ml={4}
          >
            重置为默认值
          </Button>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Box>
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
              <Button mt={4} onClick={handleSetContext} colorScheme="blue">
                设置上下文内容
              </Button>
            </Box>
            <Divider />
            <Box>
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
            <Divider />
            <Box>
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
              <Button mt={4} onClick={handleAddMessage} colorScheme="blue">
                添加消息
              </Button>
            </Box>
            <Divider />
            <Box w="100%">
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
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MessageModal;
