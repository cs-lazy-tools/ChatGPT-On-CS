import React, { useState } from 'react';
import {
  Box,
  Text,
  Divider,
  Tag,
  Flex,
  HStack,
  IconButton,
  Tooltip,
  Link,
} from '@chakra-ui/react';
import { FaBook, FaPlus, FaCheck } from 'react-icons/fa';
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
          <Tooltip label="激活插件" aria-label="Activate Plugin">
            <IconButton
              icon={<FaCheck />}
              aria-label="Activate Plugin"
              isRound
              size="sm"
              colorScheme={isActive ? 'green' : 'gray'}
              disabled={isActive}
              onClick={(e) => {
                e.stopPropagation();
                onActivate();
              }}
            />
          </Tooltip>
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
          py={2}
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
          <Flex
            align="center"
            justify="center"
            flex="0 0 75%"
            direction="column"
          >
            <Flex align="center">
              <Text fontSize="6xl" mr={2}>
                {plugin.icon}
              </Text>
              <Text fontWeight="bold" textAlign="left" whiteSpace="pre-line">
                {plugin.title}
              </Text>
            </Flex>
          </Flex>
          <Divider my={4} />
          <Flex align="center" flex="0 0 25%">
            <FaBook />
            <Link
              href="https://doc.lazaytools.top/category/%E6%8F%92%E4%BB%B6%E7%BC%96%E5%86%99%E4%BB%8B%E7%BB%8D"
              isExternal
            >
              <Text ml={2}>查看指南</Text>
            </Link>
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
          <Flex
            align="center"
            justify="center"
            flex="0 0 75%"
            direction="column"
          >
            <HStack>
              <IconButton
                icon={<FaPlus />}
                aria-label="Add Custom Tool"
                variant="outline"
                mr={2}
              />
              <Text fontWeight="bold">创建自定义工具</Text>
            </HStack>
          </Flex>
          <Divider my={4} />
          <Flex align="center" flex="0 0 25%">
            <FaBook />
            <Link
              href="https://doc.lazaytools.top/category/%E6%8F%92%E4%BB%B6%E7%BC%96%E5%86%99%E4%BB%8B%E7%BB%8D"
              isExternal
            >
              <Text ml={2}>查看指南</Text>
            </Link>
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
            {plugin.tags &&
              plugin.tags.map((tag, idx) => (
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
