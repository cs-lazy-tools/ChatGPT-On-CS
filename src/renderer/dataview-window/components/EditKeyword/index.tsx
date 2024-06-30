import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useToast,
  Flex,
  Box,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  getPlatformList,
  addReplyKeyword,
  updateReplyKeyword,
} from '../../../common/services/platform/controller';
import { Keyword, App } from '../../../common/services/platform/platform';
import GlobalSwitch from './GlobalSwitch';
import PlatformSelector from './PlatformSelector';
import KeywordInput from './KeywordInput';
import KeywordList from './KeywordList';
import ReplyInput from './ReplyInput';
import ReplyList from './ReplyList';

type EditKeywordProps = {
  editKeyword: Keyword | undefined | null;
  isOpen: boolean;
  onClose: () => void;
  handleEdit: () => void;
};

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
  const [fuzzy, setFuzzy] = useState<boolean>(true);
  const [regular, setRegular] = useState<boolean>(false);

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
    <Modal isOpen={isOpen} onClose={onClose} size={'4xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {editKeyword?.id ? '编辑关键词' : '新增关键词'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <GlobalSwitch isGlobal={isGlobal} setIsGlobal={setIsGlobal} />
          {!isGlobal && (
            <PlatformSelector
              ptf={ptf}
              setPtf={setPtf}
              platforms={platforms}
              isLoading={isPlatformsLoading}
            />
          )}

          <Flex direction="column">
            <Box m={2}>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="fuzzy" mb="0">
                  模糊匹配
                </FormLabel>
                <Switch
                  id="fuzzy"
                  isChecked={fuzzy}
                  onChange={() => setFuzzy(!fuzzy)}
                />
              </FormControl>
            </Box>
            <Box m={2}>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="regular" mb="0">
                  正则匹配
                </FormLabel>
                <Switch
                  id="regular"
                  isChecked={regular}
                  onChange={() => setRegular(!regular)}
                />
              </FormControl>
            </Box>
          </Flex>

          <KeywordInput
            newKeyword={newKeyword}
            setNewKeyword={setNewKeyword}
            handleAddKeyword={handleAddKeyword}
            startKeyword={startKeyword}
            setStartKeyword={setStartKeyword}
            endKeyword={endKeyword}
            setEndKeyword={setEndKeyword}
            handleAddFuzzyKeyword={handleAddFuzzyKeyword}
          />
          <KeywordList
            keywords={keywords}
            handleKeywordClick={handleKeywordClick}
            handleDeleteKeyword={handleDeleteKeyword}
          />
          <ReplyInput
            newReply={newReply}
            setNewReply={setNewReply}
            handleAddReply={handleAddReply}
            handleInsertRandomChar={handleInsertRandomChar}
            handleInsertFile={handleInsertFile}
            currentPlatform={currentPlatform}
          />
          <ReplyList
            replyList={replyList}
            handleReplyClick={handleReplyClick}
            handleDeleteReply={handleDeleteReply}
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            保存
          </Button>
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditKeyword;
