import React from 'react';
import {
  Box,
  Text,
  Image,
  Flex,
  Collapse,
  Button,
  useDisclosure,
  VStack,
  Heading,
  Code,
} from '@chakra-ui/react';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { Message } from '../../services/platform/platform';

const SessionBox = ({
  index,
  sessionId,
  messages,
}: {
  index: number;
  sessionId: string;
  messages: Message[];
}) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box p={5} shadow="md" borderWidth="1px">
      <Flex justify="space-between" align="center">
        {/* 左对齐 */}
        <VStack align="flex-start">
          <Heading as="h6" size="xs" cursor="pointer" onClick={onToggle}>
            <Code>{`#${index}`}</Code>
            {`  ${sessionId}`}
          </Heading>
          <Text fontSize="sm">
            时间：{messages[messages.length - 1].created_at}
          </Text>
          <Text fontSize="sm">消息数量：{messages.length}</Text>
          <Text fontSize="sm">平台：{messages[0].platform}</Text>
          {messages[0].goods_name && (
            <Text mt={2}>商品名称: {messages[0].goods_name}</Text>
          )}
          {messages[0].goods_avatar && (
            <Image
              src={messages[0].goods_avatar}
              alt="Goods Avatar"
              boxSize="50px"
              objectFit="cover"
              mt={2}
            />
          )}
        </VStack>

        <Button size="sm" onClick={onToggle}>
          {isOpen ? <TriangleDownIcon /> : <TriangleUpIcon />}
        </Button>
      </Flex>
      <Collapse in={isOpen} animateOpacity>
        <VStack mt={4} align="stretch">
          {messages.map((message, ii) => (
            <Box
              key={`${message.id}-${ii}`}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
            >
              <Text fontWeight="bold">
                {message.role === 'user' ? '用户' : '客服'}：
                {message.msg_type === 'text' ? message.content : '图片消息'}
                {message.msg_type === 'image' && (
                  <Image
                    src={message.content}
                    alt={message.content}
                    boxSize="100px"
                    objectFit="cover"
                    mt={2}
                  />
                )}
              </Text>
            </Box>
          ))}
        </VStack>
      </Collapse>
    </Box>
  );
};

export default React.memo(SessionBox);
