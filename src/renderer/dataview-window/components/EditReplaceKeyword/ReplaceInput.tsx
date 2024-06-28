import React from 'react';
import {
  Button,
  Stack,
  Text,
  Icon,
  Box,
  Tooltip,
  Flex,
} from '@chakra-ui/react';
import { FiHelpCircle } from 'react-icons/fi';
import { AddIcon } from '@chakra-ui/icons';
import MyTextarea from '../../../common/components/MyTextarea';
import Markdown from '../../../common/components/Markdown';
import { App } from '../../../common/services/platform/platform';

type ReplaceInputProps = {
  newReplace: string;
  setNewReplace: (value: string) => void;
  handleAddReplace: () => void;
  handleInsertRandomChar: () => void;
  currentPlatform: App | undefined;
};

const ReplaceInput = ({
  newReplace,
  setNewReplace,
  handleAddReplace,
  handleInsertRandomChar,
  currentPlatform,
}: ReplaceInputProps) => (
  <>
    <Flex mb="8px" mt="22px">
      <Text mr={2} fontSize={'large'} fontWeight={'bold'}>
        替换
      </Text>
      <Tooltip label="添加的多个关键词只要一个匹配上了，将会触发替换，如果有多个替换，将会随机选择一个替换。">
        <Box color={'gray.500'}>
          <Icon as={FiHelpCircle} w={6} h={6} />
        </Box>
      </Tooltip>
    </Flex>
    {currentPlatform && currentPlatform.desc && (
      <Box>
        <Markdown content={currentPlatform.desc} />
      </Box>
    )}
    <Tooltip label="在拼多多平台等平台，是不允许每次重复一个回答的，所以可以插入一个随机符，以规避这个问题">
      <Button onClick={handleInsertRandomChar} mt="4" mr={4} colorScheme="teal">
        插入随机符
      </Button>
    </Tooltip>
    <Stack direction="row" mt="4">
      <MyTextarea
        mb="4"
        maxLength={200}
        placeholder="替换内容"
        value={newReplace}
        onChange={(e) => setNewReplace(e.target.value)}
      />
      <Button onClick={handleAddReplace} colorScheme="green">
        <AddIcon />
      </Button>
    </Stack>
  </>
);

export default ReplaceInput;
