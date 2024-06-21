import React, { useState, useEffect } from 'react';
import {
  Button,
  Input,
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
import { useQuery } from '@tanstack/react-query';
import { FiHelpCircle } from 'react-icons/fi';
import { AddIcon, DeleteIcon, AttachmentIcon } from '@chakra-ui/icons';
import {
  getPlatformList,
  addReplyKeyword,
  updateReplyKeyword,
} from '../../../../common/services/platform/controller';
import MyTextarea from '../../../components/MyTextarea';
import Markdown from '../../../../common/components/Markdown';
import MyModal from '../../../components/MyModal';
import { Keyword, App } from '../../../../common/services/platform/platform';

interface EditKeywordProps {
  editKeyword: Keyword | null;
  isOpen: boolean;
  onClose: () => void;
  handleEdit: () => void;
}

const EditKeyword = ({
  editKeyword,
  isOpen,
  onClose,
  handleEdit,
}: EditKeywordProps) => {
  const toast = useToast();
  const [keywords, setKeywords] = useState<string[]>(
    editKeyword?.keyword.split('|') || [],
  );
  const [replyList, setReplyList] = useState<string[]>(
    editKeyword?.reply.split('[or]') || [],
  );

  const [isGlobal, setIsGlobal] = useState<boolean>(false);
  const [ptf, setPtf] = useState<string>(editKeyword?.platform_id || '');
  const [newKeyword, setNewKeyword] = useState<string>('');
  const [newReply, setNewReply] = useState<string>('');
  const [startKeyword, setStartKeyword] = useState<string>('');
  const [endKeyword, setEndKeyword] = useState<string>('');
  const [currentPlatform, setCurrentPlatform] = useState<App | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!editKeyword?.keyword) {
      setKeywords([]);
    } else {
      setKeywords(editKeyword?.keyword.split('|') || []);
    }

    if (!editKeyword?.reply) {
      setReplyList([]);
    } else {
      setReplyList(editKeyword?.reply.split('[or]') || []);
    }

    setPtf(editKeyword?.platform_id || '');

    if (editKeyword) {
      setIsGlobal(!editKeyword.platform_id);
    }
  }, [editKeyword]);

  const { data: platforms, isLoading: isPlatformsLoading } = useQuery(
    ['platformList'],
    getPlatformList,
  );

  useEffect(() => {
    if (ptf) {
      setCurrentPlatform(
        platforms?.data.find((platform) => platform.id === ptf),
      );
    }
  }, [platforms, ptf]);

  const handleAddKeyword = () => {
    if (newKeyword) {
      setKeywords([...keywords, newKeyword]);
      setNewKeyword('');
    }
  };

  const handleAddFuzzyKeyword = () => {
    if (startKeyword && endKeyword) {
      const fuzzyKeyword = `${startKeyword}[and]${endKeyword}`;
      setKeywords([...keywords, fuzzyKeyword]);
      setStartKeyword('');
      setEndKeyword('');
    }
  };

  const handleDeleteKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleAddReply = () => {
    if (newReply) {
      setReplyList([...replyList, newReply]);
      setNewReply('');
    }
  };

  const handleDeleteReply = (index: number) => {
    setReplyList(replyList.filter((_, i) => i !== index));
  };

  const handleInsertRandomChar = () => {
    setNewReply(`${newReply}[~]`);
  };

  const handleInsertFile = () => {
    window.electron.ipcRenderer.sendMessage('select-file');
    window.electron.ipcRenderer.once('selected-file', (path) => {
      const selectedPath = path as string[];
      if (!selectedPath.length || !selectedPath[0]) return;
      setReplyList([...replyList, `[@]${selectedPath[0]}[/@]`]);
    });
  };

  const handleKeywordClick = (keyword: string, index: number) => {
    if (keyword.includes('[and]')) {
      const parts = keyword.split('[and]');
      setStartKeyword(parts[0]);
      setEndKeyword(parts[1]);
    } else {
      setNewKeyword(keyword);
    }
    handleDeleteKeyword(index);
  };

  const handleReplyClick = (item: string, index: number) => {
    setNewReply(item);
    handleDeleteReply(index);
  };

  const handleSave = async () => {
    try {
      const updatedReply = {
        ...editKeyword,
        keyword: keywords.join('|'),
        reply: replyList.join('[or]'),
      };

      if (!isGlobal) {
        updatedReply.platform_id = ptf;
      }

      if (updatedReply.keyword === '') {
        throw new Error('关键词不能为空');
      }

      if (updatedReply.reply === '') {
        throw new Error('回复内容不能为空');
      }

      if (updatedReply.id) {
        await updateReplyKeyword(updatedReply);
      } else {
        await addReplyKeyword(updatedReply);
      }

      handleEdit();
    } catch (error: any) {
      toast({
        position: 'top',
        title: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <MyModal
      isOpen={isOpen}
      onClose={onClose}
      title={editKeyword?.id ? '编辑关键词' : '新增关键词'}
    >
      <ModalBody>
        <HStack width="full" alignItems="center" my={3}>
          <Box width="30%">
            <Flex mt={3}>
              <Text mr={2} fontSize={'large'} fontWeight={'bold'}>
                全局关键词
              </Text>
              <Tooltip label="该关键词是否面向全部平台，否则请选择一个适用的平台">
                <Box color={'gray.500'}>
                  <Icon as={FiHelpCircle} w={6} h={6} />
                </Box>
              </Tooltip>
            </Flex>
          </Box>
          <Box width="70%">
            <Switch
              isChecked={isGlobal}
              onChange={() => setIsGlobal(!isGlobal)}
            />
          </Box>
        </HStack>

        {!isGlobal && (
          <HStack width="full" alignItems="center" mb={5}>
            <Box width="30%">
              <Text>选择平台：</Text>
            </Box>
            <Box width="70%">
              <Select
                value={ptf || ''}
                onChange={(e) => setPtf(e.target.value)}
                isDisabled={isPlatformsLoading}
              >
                {platforms?.data.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </Select>
            </Box>
          </HStack>
        )}

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
            placeholder="开始关键词"
            value={startKeyword}
            onChange={(e) => setStartKeyword(e.target.value)}
          />
          <Input
            placeholder="结束关键词"
            value={endKeyword}
            onChange={(e) => setEndKeyword(e.target.value)}
          />
          <Tooltip label="新增一个范围关键词，如果匹配上了开始关键词和结束关键词，也能匹配成功">
            <Button onClick={handleAddFuzzyKeyword} colorScheme="green">
              <AddIcon />
            </Button>
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={4} wrap="wrap">
          {keywords.map((keyword, index) => (
            <Text
              key={index}
              p="1"
              borderRadius="md"
              borderWidth="1px"
              cursor="pointer"
              maxWidth="220px"
              onClick={() => handleKeywordClick(keyword, index)}
              style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
            >
              {keyword}
              <IconButton
                ml={3}
                aria-label="Delete keyword"
                colorScheme="red"
                icon={<DeleteIcon />}
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteKeyword(index);
                }}
              />
            </Text>
          ))}
        </Stack>

        <Flex mb="8px" mt="22px">
          <Text mr={2} fontSize={'large'} fontWeight={'bold'}>
            回复内容
          </Text>
          <Tooltip label="添加的多个关键词只要一个匹配上了，将会触发回复，如果有多个回复，将会随机选择一个回复。">
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
          <Button
            onClick={handleInsertRandomChar}
            mt="4"
            mr={4}
            colorScheme="teal"
          >
            插入随机符
          </Button>
        </Tooltip>
        <Tooltip label="有些无法发送文件或者图片的平台无法使用该文件">
          <Button
            leftIcon={<AttachmentIcon />}
            mt="4"
            onClick={handleInsertFile}
            colorScheme="orange"
          >
            插入文件
          </Button>
        </Tooltip>

        <Stack direction="row" mt="4">
          <MyTextarea
            mb="4"
            maxLength={200}
            placeholder="回复内容"
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
          />
          <Button onClick={handleAddReply} colorScheme="green">
            <AddIcon />
          </Button>
        </Stack>
        <Stack direction="row" spacing={4} wrap="wrap">
          {replyList.map((item, index) => (
            <Text
              key={index}
              p="1"
              borderRadius="md"
              borderWidth="1px"
              cursor="pointer"
              maxWidth="220px"
              onClick={() => handleReplyClick(item, index)}
              style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
            >
              {item}
              <IconButton
                ml={3}
                aria-label="Delete reply"
                icon={<DeleteIcon />}
                colorScheme="red"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteReply(index);
                }}
              />
            </Text>
          ))}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="blue" mr={3} onClick={handleSave}>
          保存
        </Button>
        <Button variant="ghost" onClick={onClose}>
          取消
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default EditKeyword;
