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
import { DeleteIcon } from '@chakra-ui/icons';

type ReplyListProps = {
  replyList: string[];
  handleReplyClick: (reply: string, index: number) => void;
  handleDeleteReply: (index: number) => void;
};

const ReplyList = ({
  replyList,
  handleReplyClick,
  handleDeleteReply,
}: ReplyListProps) => (
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
);

export default ReplyList;
