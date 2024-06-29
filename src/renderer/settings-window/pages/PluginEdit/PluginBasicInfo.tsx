import React, { useState } from 'react';
import {
  VStack,
  Text,
  Input,
  Textarea,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  Button,
  Box,
  Flex,
} from '@chakra-ui/react';
import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { Plugin } from '../../../common/services/platform/platform';

type PluginBasicInfoProps = {
  plugin: Plugin;
  handleUpdateConfig: (config: Partial<Plugin>) => void;
};

const PluginBasicInfo: React.FC<PluginBasicInfoProps> = ({
  plugin,
  handleUpdateConfig,
}) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const handleTagRemove = (tagToRemove: string) => {
    if (!plugin.tags) return;

    const updatedTags = plugin.tags.filter((tag) => tag !== tagToRemove);
    handleUpdateConfig({ tags: updatedTags });
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      if (!plugin.tags) return;

      handleUpdateConfig({
        tags: [...plugin.tags, e.currentTarget.value.trim()],
      });
      e.currentTarget.value = '';
    }
  };

  const onEmojiClick = (emojiObject: EmojiClickData) => {
    handleUpdateConfig({ icon: emojiObject.emoji });
    setIsEmojiPickerOpen(false);
  };

  return (
    <Box position="relative" width="100%">
      {plugin.source !== 'custom' && (
        <Flex
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          justifyContent="center"
          alignItems="center"
          zIndex="1"
        >
          <Text color="white" fontSize="lg">
            系统插件无法编辑
          </Text>
        </Flex>
      )}

      <VStack spacing="4" align="start" width="100%">
        {plugin.author && <Text>作者: {plugin.author}</Text>}
        <HStack>
          <Input
            placeholder="插件标题"
            value={plugin.title}
            onChange={(e) => handleUpdateConfig({ title: e.target.value })}
          />
          <Button onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}>
            {plugin.icon || '😀'}
          </Button>
          {isEmojiPickerOpen && (
            <Box position="absolute" zIndex="1">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                emojiStyle={EmojiStyle.NATIVE}
              />
            </Box>
          )}
        </HStack>

        <Textarea
          placeholder="描述"
          value={plugin.description}
          onChange={(e) => handleUpdateConfig({ description: e.target.value })}
        />
        <VStack align="start" width="100%">
          <Text>标签:</Text>
          <HStack wrap="wrap">
            {plugin.tags &&
              plugin.tags.map((tag, idx) => (
                <Tag
                  key={idx}
                  size="md"
                  borderRadius="full"
                  variant="solid"
                  colorScheme="teal"
                >
                  <TagLabel>{tag}</TagLabel>
                  <TagCloseButton onClick={() => handleTagRemove(tag)} />
                </Tag>
              ))}
          </HStack>
          <Input placeholder="按 Enter 添加标签" onKeyDown={handleTagAdd} />
        </VStack>
      </VStack>
    </Box>
  );
};

export default PluginBasicInfo;
