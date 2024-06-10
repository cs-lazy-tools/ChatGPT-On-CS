import React from 'react';
import { Flex, Stack, Skeleton } from '@chakra-ui/react';
import SettingsModal from './SettingsModal';
import AppListComponent from './AppListComponent';
import InstanceListComponent from './InstanceListComponent';
import { AppManagerProvider, useAppManager } from './AppManagerContext';

const AppManagerContent = () => {
  const {
    data,
    isLoading,
    isSettingsOpen,
    setIsSettingsOpen,
    selectedAppId,
    selectedInstanceId,
  } = useAppManager();

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
    <Flex h="42vh">
      <AppListComponent />
      <InstanceListComponent />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        appId={selectedAppId || undefined}
        instanceId={selectedInstanceId || undefined}
      />
    </Flex>
  );
};

const AppManagerComponent = () => {
  return (
    <AppManagerProvider>
      <AppManagerContent />
    </AppManagerProvider>
  );
};

export default React.memo(AppManagerComponent);
