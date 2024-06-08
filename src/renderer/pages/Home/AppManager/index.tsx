import React, { useState, useEffect } from 'react';
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
import {
  SearchIcon,
  SettingsIcon,
  DeleteIcon,
  AddIcon,
} from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';
import defaultPlatformIcon from '../../../../../assets/base/default-platform-icon.png';
import windowsIcon from '../../../../../assets/base/windows.png';
import { getPlatformList } from '../../../services/platform/controller';

const AppManagerComponent = () => {
  const { data, isLoading } = useQuery(['platformList'], getPlatformList);
  const [selectedApp, setSelectedApp] = useState<number | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<number | null>(null);
  const [filteredInstances, setFilteredInstances] = useState<
    {
      task_id: string;
      app_id: string;
      env_id: string;
      avatar: string;
    }[]
  >([]);
  const high = '42vh'; // 调整为合适的全局高度

  const instances = [
    { task_id: '12321234', app_id: 'bilibili', env_id: '1' },
    { task_id: '3113131', app_id: 'zhihu', env_id: '2' },
    { task_id: '1231234', app_id: 'douyin', env_id: '1' },
    { task_id: '311673131', app_id: 'zhihu', env_id: '2' },
    { task_id: '1234534', app_id: 'bilibili', env_id: '1' },
    { task_id: '316713131', app_id: 'zhihu', env_id: '2' },
    { task_id: '1237534', app_id: 'bilibili', env_id: '1' },
    { task_id: '3144513131', app_id: 'weibo', env_id: '2' },
    { task_id: '12356434', app_id: 'weibo', env_id: '1' },
    { task_id: '3167713131', app_id: 'zhihu', env_id: '2' },
    { task_id: '12345434', app_id: 'jinritemai', env_id: '1' },
    { task_id: '3155413131', app_id: 'zhihu', env_id: '2' },
    { task_id: '126644334', app_id: 'jinritemai', env_id: '1' },
    { task_id: '334113131', app_id: 'zhihu', env_id: '2' },
    { task_id: '124343334', app_id: 'bilibili', env_id: '1' },
    { task_id: '3136613131', app_id: 'zhihu', env_id: '2' },
  ];

  useEffect(() => {
    if (selectedApp !== null && data && data.data) {
      const selectedAppId = data.data[selectedApp]?.id;
      const matchedInstances = instances.filter(
        (instance) => instance.app_id === selectedAppId,
      );
      setFilteredInstances(
        matchedInstances.map((x) => {
          return {
            ...x,
            avatar: data.data[selectedApp]?.avatar || defaultPlatformIcon,
          };
        }),
      );
    } else {
      setFilteredInstances([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApp, data]);

  if (isLoading || !data || !data.data) {
    return (
      <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  const handleDelete = (taskId: string) => {
    setFilteredInstances(
      filteredInstances.filter((instance) => instance.task_id !== taskId),
    );
  };

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
          {[...data.data].map((app, i) => {
            const appInstancesCount = instances.filter(
              (instance) => instance.app_id === app.id,
            ).length;

            return (
              <Flex
                key={i}
                bg="gray.100"
                borderRadius="md"
                p={3}
                align="center"
                position="relative"
                outline={
                  selectedApp === i
                    ? '3px solid var(--chakra-colors-teal-300)'
                    : 'none'
                }
                cursor="pointer"
                onClick={() => {
                  setSelectedApp(i);
                  setSelectedInstance(null);
                }}
              >
                {/* 红点标记 */}
                {appInstancesCount > 0 && (
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
                    {appInstancesCount}
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
            );
          })}
        </VStack>
      </Box>
      <Box w="60%" p={4} bg="gray.50" overflowY="auto">
        <VStack spacing={4}>
          {filteredInstances.length > 0 ? (
            filteredInstances.map((instance, i) => (
              <Flex
                key={i}
                w="100%"
                h="50px"
                bg="gray.200"
                borderRadius="md"
                align="center"
                p={3}
                justify="space-between"
                outline={
                  selectedInstance === i
                    ? '3px solid var(--chakra-colors-teal-300)'
                    : 'none'
                }
                onClick={() => {
                  setSelectedInstance(i);
                }}
              >
                <HStack spacing={3}>
                  <Image
                    src={instance.avatar}
                    fallbackSrc={defaultPlatformIcon}
                    boxSize="25px"
                  />
                  <Badge colorScheme="gray">{instance.task_id}</Badge>
                </HStack>
                <HStack spacing={3}>
                  <IconButton
                    fontSize="15px"
                    aria-label="Settings"
                    icon={<SettingsIcon />}
                    onClick={() => {}}
                  />
                  <IconButton
                    color="red.500"
                    aria-label="Delete instance"
                    icon={<DeleteIcon />}
                    onClick={() => handleDelete(instance.task_id)}
                  />
                </HStack>
              </Flex>
            ))
          ) : (
            <Text fontSize="xl" color="gray.500">
              没有启动该应用的客服
            </Text>
          )}

          {/* 新建客服 */}
          <Tooltip label={`新增一个客服账户`}>
            <Flex
              w="100%"
              h="50px"
              bg="gray.100"
              borderRadius="md"
              align="center"
              p={3}
              justify="center"
              cursor="pointer"
              onClick={() => {}}
              _hover={{ bg: 'gray.200' }}
            >
              {/* 关掉 IconButton 单独的  _hover */}
              <IconButton
                aria-label="Add instance"
                variant="unstyled"
                icon={<AddIcon />}
              />
            </Flex>
          </Tooltip>
        </VStack>
      </Box>
    </Flex>
  );
};

export default React.memo(AppManagerComponent);
