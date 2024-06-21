import React from 'react';
import { Flex, Image, Badge, HStack, IconButton } from '@chakra-ui/react';
import { SettingsIcon, DeleteIcon } from '@chakra-ui/icons';
import defaultPlatformIcon from '../../../../../assets/base/default-platform-icon.png';

type InstanceCardComponentProps = {
  instance: {
    task_id: string;
    app_id: string;
    env_id: string;
    avatar?: string;
  };
  selectedInstanceId: string | null;
  setSelectedInstanceId: React.Dispatch<React.SetStateAction<string | null>>;
  handleDelete: (taskId: string) => void;
  openSettings: () => void;
};

const InstanceCardComponent = ({
  instance,
  selectedInstanceId,
  setSelectedInstanceId,
  handleDelete,
  openSettings,
}: InstanceCardComponentProps) => (
  <Flex
    w="100%"
    h="50px"
    bg="gray.200"
    borderRadius="md"
    align="center"
    p={3}
    justify="space-between"
    outline={
      selectedInstanceId === instance.task_id
        ? '3px solid var(--chakra-colors-teal-300)'
        : 'none'
    }
    onClick={() => setSelectedInstanceId(instance.task_id)}
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
        onClick={openSettings}
      />
      <IconButton
        color="red.500"
        aria-label="Delete instance"
        icon={<DeleteIcon />}
        onClick={() => handleDelete(instance.task_id)}
      />
    </HStack>
  </Flex>
);

export default InstanceCardComponent;
