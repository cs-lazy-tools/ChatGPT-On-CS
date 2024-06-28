import React, { useState } from 'react';
import {
  Box,
  Text,
  Divider,
  Tag,
  Flex,
  IconButton,
  Checkbox,
} from '@chakra-ui/react';
import { FaBook, FaPlus } from 'react-icons/fa';
import { Plugin } from '../../../common/services/platform/platform';

const PluginCard = ({
  plugin,
  isActive,
  onActivate,
  onEdit,
}: {
  plugin: Plugin;
  isActive: boolean;
  onActivate: () => void;
  onEdit?: () => void;
}) => {
  const [selected, setSelected] = useState(false);
  const handleMouseEnter = () => setSelected(true);
  const handleMouseLeave = () => setSelected(false);

  return (
    <Box
      position="relative"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      bg={selected ? 'white' : 'gray.50'}
      boxShadow={selected ? 'lg' : 'none'}
      borderColor={selected ? 'blue.500' : 'gray.200'}
      borderStyle="solid"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onEdit}
    >
      {plugin.type === 'plugin' && (
        <Flex position="absolute" top={2} right={2}>
          <Checkbox isChecked={isActive} onChange={onActivate} />
        </Flex>
      )}

      {isActive && plugin.type === 'plugin' && (
        <Box
          position="absolute"
          top={0}
          right={0}
          bg="green.500"
          color="white"
          px={2}
          py={1}
          borderBottomLeftRadius="md"
        >
          已激活
        </Box>
      )}

      {plugin.type === 'guide' && (
        <Flex
          direction="column"
          align="flex-start"
          justify="center"
          height="100%"
        >
          <Flex align="flex-start">
            <Text fontSize="4xl">{plugin.icon}</Text>
            <Text
              fontWeight="bold"
              textAlign="left"
              whiteSpace="pre-line"
              mt={2}
            >
              {plugin.title}
            </Text>
          </Flex>
          <Divider my={4} />
          <Flex align="center">
            <FaBook />
            <Text ml={2}>查看指南</Text>
          </Flex>
        </Flex>
      )}

      {plugin.type === 'custom' && (
        <Flex
          direction="column"
          align="flex-start"
          justify="center"
          height="100%"
        >
          <Flex align="center">
            <IconButton
              icon={<FaPlus />}
              aria-label="Add Custom Tool"
              variant="outline"
              mr={2}
            />
            <Text fontWeight="bold">创建自定义工具</Text>
          </Flex>
          <Divider my={4} />
          <Flex align="center">
            <FaBook />
            <Text ml={2}>查看帮助</Text>
          </Flex>
        </Flex>
      )}

      {plugin.type === 'plugin' && (
        <>
          <Flex>
            <Text fontSize="4xl">{plugin.icon}</Text>
            <Box ml={4}>
              <Text fontWeight="bold" textAlign="left">
                {plugin.title}
              </Text>
              <Text color="gray.500" textAlign="left">
                {plugin.author}
              </Text>
            </Box>
          </Flex>
          <Text mt={4} textAlign="left">
            {plugin.description}
          </Text>
          <Flex mt={4} wrap="wrap">
            {plugin.tags.map((tag, idx) => (
              <Tag key={idx} mr={2} mt={2}>
                {tag}
              </Tag>
            ))}
          </Flex>
        </>
      )}
    </Box>
  );
};

export default PluginCard;
