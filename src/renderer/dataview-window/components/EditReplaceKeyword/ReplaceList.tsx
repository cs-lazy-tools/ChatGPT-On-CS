import React from 'react';
import { Stack, Text, IconButton } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

type ReplaceListProps = {
  replyList: string[];
  handleReplaceClick: (reply: string, index: number) => void;
  handleDeleteReplace: (index: number) => void;
};

const ReplaceList = ({
  replyList,
  handleReplaceClick,
  handleDeleteReplace,
}: ReplaceListProps) => (
  <Stack direction="row" spacing={4} wrap="wrap">
    {replyList.map((item, index) => (
      <Text
        key={index}
        p="1"
        borderRadius="md"
        borderWidth="1px"
        cursor="pointer"
        maxWidth="220px"
        onClick={() => handleReplaceClick(item, index)}
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
            handleDeleteReplace(index);
          }}
        />
      </Text>
    ))}
  </Stack>
);

export default ReplaceList;
