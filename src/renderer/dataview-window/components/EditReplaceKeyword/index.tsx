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
  addReplaceKeyword,
  updateReplaceKeyword,
} from '../../../common/services/platform/controller';
import {
  ReplaceKeyword,
  App,
} from '../../../common/services/platform/platform';
import GlobalSwitch from './GlobalSwitch';
import PlatformSelector from './PlatformSelector';
import KeywordInput from './KeywordInput';
import KeywordList from './KeywordList';
import ReplaceInput from './ReplaceInput';
import ReplaceList from './ReplaceList';

type EditKeywordProps = {
  editKeyword: ReplaceKeyword | undefined | null;
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
  const [replaceList, setReplaceList] = useState<string[]>(
    editKeyword?.replace.split('[or]') || [],
  );

  const [isGlobal, setIsGlobal] = useState<boolean>(false);
  const [ptf, setPtf] = useState<string>(editKeyword?.app_id || '');
  const [newKeyword, setNewKeyword] = useState<string>('');
  const [newReplace, setNewReplace] = useState<string>('');
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

    if (!editKeyword?.replace) {
      setReplaceList([]);
    } else {
      setReplaceList(editKeyword?.replace.split('[or]') || []);
    }

    setPtf(editKeyword?.app_id || '');

    if (editKeyword) {
      setIsGlobal(!editKeyword.app_id);
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
    if (newReplace) {
      setReplaceList([...replaceList, newReplace]);
      setNewReplace('');
    }
  };

  const handleDeleteReplace = (index: number) => {
    setReplaceList(replaceList.filter((_, i) => i !== index));
  };

  const handleInsertRandomChar = () => {
    setNewReplace(`${newReplace}[~]`);
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

  const handleReplaceClick = (item: string, index: number) => {
    setNewReplace(item);
    handleDeleteReplace(index);
  };

  const handleSave = async () => {
    try {
      const updatedReplace = {
        ...editKeyword,
        keyword: keywords.join('|'),
        replace: replaceList.join('[or]'),
      };

      if (!isGlobal) {
        updatedReplace.app_id = ptf;
      }

      if (updatedReplace.keyword === '') {
        throw new Error('关键词不能为空');
      }

      if (updatedReplace.replace === '') {
        throw new Error('替换用的关键词不能为空');
      }

      if (updatedReplace.id) {
        await updateReplaceKeyword(updatedReplace);
      } else {
        await addReplaceKeyword(updatedReplace);
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
          {editKeyword?.id ? '编辑替换关键词' : '新增替换关键词'}
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

          {/* 垂直展示 */}
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
          <ReplaceInput
            newReplace={newReplace}
            setNewReplace={setNewReplace}
            handleAddReplace={handleAddReply}
            handleInsertRandomChar={handleInsertRandomChar}
            currentPlatform={currentPlatform}
          />
          <ReplaceList
            replyList={replaceList}
            handleReplaceClick={handleReplaceClick}
            handleDeleteReplace={handleDeleteReplace}
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
