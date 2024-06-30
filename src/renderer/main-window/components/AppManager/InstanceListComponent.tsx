import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Flex,
  IconButton,
  Tooltip,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import InstanceCardComponent from './InstanceCardComponent';
import { useAppManager } from './AppManagerContext';
import { trackButtonClick } from '../../../common/services/analytics';

const InstanceListComponent = () => {
  const {
    filteredInstances,
    selectedInstanceId,
    selectedAppId,
    isTasksLoading,
    setSelectedInstanceId,
    handleDelete,
    handleAddTask,
    setIsSettingsOpen,
  } = useAppManager();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentAppId, setCurrentAppId] = useState(selectedAppId);
  const toast = useToast();

  useEffect(() => {
    setCurrentAppId(selectedAppId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAppId]);

  const handleAddTaskWrapper = async () => {
    try {
      trackButtonClick(`add_task_${selectedAppId || ''}`);
      await handleAddTask();
    } catch (error) {
      toast({
        title: '添加失败',
        description: (error as Error).message || '未知错误',
        position: 'top',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  let content;

  if (!selectedAppId) {
    return (
      <Flex justifyContent="center" alignItems="center" w="60%" h="100%">
        <Text fontSize="xl" color="gray.500">
          请先选择一个应用
        </Text>
      </Flex>
    );
  }

  if (filteredInstances.length > 0) {
    content = filteredInstances.map((instance, i) => (
      <InstanceCardComponent
        key={i}
        instance={instance}
        selectedInstanceId={selectedInstanceId}
        setSelectedInstanceId={setSelectedInstanceId}
        handleDelete={handleDelete}
        openSettings={() => setIsSettingsOpen(true)}
      />
    ));
  } else {
    content = (
      <Text fontSize="xl" color="gray.500">
        没有启动该应用的客服
      </Text>
    );
  }

  return (
    <Box w="60%" p={4} bg="gray.50" overflowY="auto">
      <VStack spacing={4}>
        {content}
        {isTasksLoading ? (
          <Flex justifyContent="center" alignItems="center" w="100%" h="50px">
            <Spinner size="md" />
          </Flex>
        ) : (
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
              onClick={handleAddTaskWrapper}
              _hover={{ bg: 'gray.200' }}
            >
              <IconButton
                aria-label="Add instance"
                variant="unstyled"
                icon={<AddIcon />}
              />
            </Flex>
          </Tooltip>
        )}
      </VStack>
    </Box>
  );
};

export default InstanceListComponent;
