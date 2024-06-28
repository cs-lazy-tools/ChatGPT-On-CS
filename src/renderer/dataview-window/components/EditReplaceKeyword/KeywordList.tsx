import React from 'react';
import { Stack, Text, IconButton } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

type KeywordListProps = {
  keywords: string[];
  handleKeywordClick: (keyword: string, index: number) => void;
  handleDeleteKeyword: (index: number) => void;
};

const KeywordList = ({
  keywords,
  handleKeywordClick,
  handleDeleteKeyword,
}: KeywordListProps) => (
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
);

export default KeywordList;
