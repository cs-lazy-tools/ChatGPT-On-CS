import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import AppCardComponent from './AppCardComponent';
import SearchBarComponent from './SearchBarComponent';
import { useAppManager } from './AppManagerContext';

const AppListComponent = () => {
  const {
    data,
    selectedAppId,
    setSelectedAppId,
    setSelectedInstanceId,
    handleSearch,
    setIsSettingsOpen,
    instances,
  } = useAppManager();

  return (
    <Box w="40%" bg="brand.50" display="flex" flexDirection="column">
      <Box p={2} position="sticky" top="0" zIndex="1">
        <SearchBarComponent onSearch={handleSearch} />
      </Box>
      <VStack spacing={3} align="stretch" overflowY="auto" flex="1" p={4}>
        {data?.data.map((app, i) => (
          <AppCardComponent
            key={i}
            app={app}
            selectedAppId={selectedAppId}
            setSelectedAppId={setSelectedAppId}
            openSettings={() => {
              setSelectedAppId(app.id);
              setSelectedInstanceId(null);
              setIsSettingsOpen(true);
            }}
            instances={instances}
          />
        ))}
      </VStack>
    </Box>
  );
};

export default AppListComponent;
