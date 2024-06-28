import React, { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Stack,
  Text,
  Icon,
  HStack,
  Box,
  Switch,
  Select,
  IconButton,
  Tooltip,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { FiHelpCircle } from 'react-icons/fi';
import { AddIcon } from '@chakra-ui/icons';

type KeywordInputProps = {
  newKeyword: string;
  setNewKeyword: (value: string) => void;
  handleAddKeyword: () => void;
  startKeyword: string;
  setStartKeyword: (value: string) => void;
  endKeyword: string;
  setEndKeyword: (value: string) => void;
  handleAddFuzzyKeyword: () => void;
};

const KeywordInput = ({
  newKeyword,
  setNewKeyword,
  handleAddKeyword,
  startKeyword,
  setStartKeyword,
  endKeyword,
  setEndKeyword,
  handleAddFuzzyKeyword,
}: KeywordInputProps) => (
  <>
    <Flex mb="8px" mt="12px">
      <Text mr={2} fontSize={'large'} fontWeight={'bold'}>
        关键词设置
      </Text>
      <Tooltip label="设置关键词以匹配具体的回复，命中关键词的问题，不会使用 GPT 进行回答">
        <Box color={'gray.500'}>
          <Icon as={FiHelpCircle} w={6} h={6} />
        </Box>
      </Tooltip>
    </Flex>
    <Stack direction="row" mb="4">
      <Input
        placeholder="新增关键词"
        value={newKeyword}
        onChange={(e) => setNewKeyword(e.target.value)}
      />
      <Tooltip label="新增一条关键词，可以使用 * 字符模糊匹配，如果要输入 * 字符，则使用 \* 代替">
        <Button onClick={handleAddKeyword} colorScheme="green">
          <AddIcon />
        </Button>
      </Tooltip>
    </Stack>
    <Stack direction="row" mb="4">
      <Input
        placeholder="起始匹配关键词"
        value={startKeyword}
        onChange={(e) => setStartKeyword(e.target.value)}
      />
      <Input
        placeholder="结束匹配关键词"
        value={endKeyword}
        onChange={(e) => setEndKeyword(e.target.value)}
      />
      <Tooltip label="新增一个范围关键词，如果匹配上了开始关键词和结束关键词，也能匹配成功">
        <Button onClick={handleAddFuzzyKeyword} colorScheme="green">
          <AddIcon />
        </Button>
      </Tooltip>
    </Stack>
  </>
);

export default KeywordInput;
