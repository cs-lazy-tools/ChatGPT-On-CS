import React from 'react';
import {
  Box,
  Flex,
  Image,
  Badge,
  HStack,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { SettingsIcon } from '@chakra-ui/icons';
import defaultPlatformIcon from '../../../../../assets/base/default-platform-icon.png';
import windowsIcon from '../../../../../assets/base/windows.png';

type AppCardComponentProps = {
  app: {
    id: string;
    name: string;
    avatar?: string;
    env?: string;
  };
  selectedAppId: string | null;
  setSelectedAppId: React.Dispatch<React.SetStateAction<string | null>>;
  openSettings: (e: boolean) => void;
  instances: {
    task_id: string;
    app_id: string;
    env_id: string;
  }[];
};

const AppCardComponent = ({
  app,
  selectedAppId,
  setSelectedAppId,
  openSettings,
  instances,
}: AppCardComponentProps) => {
  const appInstancesCount = instances.filter(
    (instance) => instance.app_id === app.id,
  ).length;

  return (
    <Flex
      bg="gray.100"
      borderRadius="md"
      p={3}
      align="center"
      position="relative"
      outline={
        selectedAppId === app.id
          ? '3px solid var(--chakra-colors-teal-300)'
          : 'none'
      }
      cursor="pointer"
      onClick={() => {
        setSelectedAppId(app.id);
      }}
    >
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
      <Box position="absolute" bottom="5px" right="-5px">
        <Tooltip label={`设置 ${app.name} 平台`}>
          <IconButton
            variant="borderless"
            aria-label={`设置 ${app.name} 平台`}
            fontSize="15px"
            w={4}
            h={4}
            icon={<SettingsIcon />}
            onClick={(e) => {
              e.stopPropagation();
              openSettings(true);
            }}
          />
        </Tooltip>
      </Box>
    </Flex>
  );
};

export default AppCardComponent;
