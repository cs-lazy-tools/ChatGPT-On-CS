import React, { useState } from 'react';
import {
  VStack,
  Text,
  Divider,
  Input,
  Textarea,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  Button,
  Box,
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
    const updatedTags = plugin.tags.filter((tag) => tag !== tagToRemove);
    handleUpdateConfig({ tags: updatedTags });
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
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
    <VStack spacing="4" align="start" width="100%">
      <Text fontSize="1xl" fontWeight="bold">
        插件基础信息
      </Text>
      <Divider />
      {plugin.author && <Text>作者: {plugin.author}</Text>}
      {plugin.type && <Text>插件类型: {plugin.type}</Text>}
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
          {plugin.tags.map((tag, idx) => (
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
  );
};

export default PluginBasicInfo;
