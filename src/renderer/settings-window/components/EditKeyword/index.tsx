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
} from '@chakra-ui/react';
import ReplyInput from './ReplyInput';
import ReplyList from './ReplyList';

type EditKeywordProps = {
  reply: string;
  isOpen: boolean;
  onClose: () => void;
  handleEdit: (val: string) => void;
};

const EditKeyword = ({
  reply,
  isOpen,
  onClose,
  handleEdit,
}: EditKeywordProps) => {
  const toast = useToast();
  const [replyList, setReplyList] = useState<string[]>(
    reply.split('[or]') || [],
  );

  const [newReply, setNewReply] = useState<string>('');

  useEffect(() => {
    if (!reply) {
      setReplyList([]);
    } else {
      setReplyList(reply.split('[or]') || []);
    }
  }, [reply]);

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

  const handleReplyClick = (item: string, index: number) => {
    setNewReply(item);
    handleDeleteReply(index);
  };

  const handleSave = async () => {
    try {
      if (replyList.length === 0) {
        throw new Error('回复内容不能为空');
      }

      await handleEdit(replyList.join('[or]'));

      toast({
        position: 'top',
        title: '保存成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        position: 'top',
        title: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={'4xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>编辑默认回复</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <ReplyInput
            newReply={newReply}
            setNewReply={setNewReply}
            handleAddReply={handleAddReply}
            handleInsertRandomChar={handleInsertRandomChar}
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
