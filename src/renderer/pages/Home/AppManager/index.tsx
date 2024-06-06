import React from 'react';
import {
  Box,
  Flex,
  Input,
  Image,
  InputGroup,
  Tooltip,
  InputRightElement,
  Badge,
  Text,
  VStack,
  HStack,
  IconButton,
  Stack,
  Skeleton,
} from '@chakra-ui/react';
import { SearchIcon, SettingsIcon } from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';
import defaultPlatformIcon from '../../../../../assets/base/default-platform-icon.png';
import windowsIcon from '../../../../../assets/base/windows.png';
import { getPlatformList } from '../../../services/platform/controller';

const AppManagerComponent = () => {
  const { data, isLoading } = useQuery(['platformList'], getPlatformList);
  const high = '42vh'; // 调整为合适的全局高度

  if (isLoading || !data || !data.data) {
    return (
      <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  return (
    <Flex h={high}>
      <Box w="40%" bg="brand.50" display="flex" flexDirection="column">
        <Box p={2} position="sticky" top="0" zIndex="1">
          <Flex align="center">
            <InputGroup>
              <Input placeholder="搜索" />
              <InputRightElement>
                <IconButton
                  icon={<SearchIcon />}
                  variant="ghost"
                  colorScheme="brand"
                  aria-label="Search"
                  size="sm"
                />
              </InputRightElement>
            </InputGroup>
          </Flex>
        </Box>
        <VStack spacing={3} align="stretch" overflowY="auto" flex="1" p={4}>
          {[...data.data].map((app, i) => (
            <Flex
              key={i}
              bg="gray.100"
              borderRadius="md"
              p={3}
              align="center"
              position="relative"
            >
              {/* 红点标记 */}
              {10 > 0 && (
                <Box
                  position="absolute"
                  top="-5px"
                  right="-5px"
                  bg="red.500"
                  color="white"
                  borderRadius="full"
                  width="20px"
                  height="20px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="12px"
                >
                  {10}
                </Box>
              )}

              {/* Avatar 及其右上角的 windowsIcon */}
              <Box position="relative" marginRight="12px">
                <Image
                  src={app.avatar || defaultPlatformIcon}
                  fallbackSrc={defaultPlatformIcon}
                  boxSize="25px"
                />
                {app.env === 'desktop' && (
                  <Tooltip label="客户端应用，需要先手动打开该应用">
                    <Image
                      src={windowsIcon}
                      boxSize="15px"
                      position="absolute"
                      top="-5px"
                      right="-5px"
                      alt="windows"
                    />
                  </Tooltip>
                )}
              </Box>

              <HStack align="center" flex="1">
                <Badge colorScheme="gray">{app.name}</Badge>
              </HStack>

              {/* 设置按钮固定在右下角 */}
              <Box position="absolute" bottom="5px" right="-5px">
                <Tooltip label={`设置 ${app.name} 平台`}>
                  <IconButton
                    variant="borderless"
                    aria-label={`设置 ${app.name} 平台`}
                    fontSize="15px"
                    w={4}
                    h={4}
                    icon={<SettingsIcon />}
                    onClick={() => {}}
                  />
                </Tooltip>
              </Box>
            </Flex>
          ))}
        </VStack>
      </Box>
      <Box w="60%" p={4} bg="gray.50" overflowY="auto">
        <VStack spacing={4}>
          {[...Array(20)].map((_, i) => (
            <Box key={i} w="100%" h="100px" bg="gray.200" borderRadius="md" />
          ))}
          <Box
            w="100%"
            h="100px"
            bg="gray.300"
            borderRadius="md"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Text fontSize="3xl" color="gray.500">
              +
            </Text>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};

export default React.memo(AppManagerComponent);
