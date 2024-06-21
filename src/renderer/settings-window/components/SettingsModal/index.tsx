import React, { useEffect, useState, useCallback } from 'react';
import {
  ChakraProvider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Checkbox,
  Box,
  Flex,
  Text,
  useToast,
} from '@chakra-ui/react';
import GeneralSettings from '../Settings/GeneralSettings';
import LLMSettings from '../Settings/LLMSettings';
import PluginSettings from '../Settings/PluginSettings';
import {
  activeConfig,
  checkConfigActive,
} from '../../../common/services/platform/controller';
// import { useAppManager } from './AppManagerContext';

const SettingsModal = ({
  isOpen,
  onClose,
  appId,
  instanceId,
}: {
  isOpen: boolean;
  onClose: () => void;
  appId?: string;
  instanceId?: string;
}) => {
  // const { data: appInfo } = useAppManager();
  const [appName, setAppName] = useState<string | undefined>(undefined);

  const toast = useToast();
  const [isActive, setIsActive] = useState(false);
  const [data, setData] = useState<{
    active: boolean;
  } | null>(null);

  const fetchConfigActive = useCallback(async () => {
    try {
      const resp = await checkConfigActive({ appId, instanceId });
      // @ts-ignore
      setData(resp.data);
    } catch (error) {
      const errormsg =
        error instanceof Error ? error.message : JSON.stringify(error);
      toast({
        title: '获取配置失败',
        description: errormsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, instanceId]);

  useEffect(() => {
    // setAppName(appInfo?.data.find((app) => app.id === appId)?.name);
    fetchConfigActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, instanceId]);

  useEffect(() => {
    if (data) {
      setIsActive(data.active);
    }
  }, [data]);

  const handleCheckboxChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!data) {
        return;
      }

      try {
        setIsActive(event.target.checked);
        await activeConfig({
          active: event.target.checked,
          appId,
          instanceId,
        });
        toast({
          title: '更新配置成功',
          position: 'top',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        const errormsg =
          error instanceof Error ? error.message : JSON.stringify(error);
        toast({
          title: '更新配置失败',
          description: errormsg,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appId, instanceId],
  );

  return (
    <ChakraProvider>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            设置
            <Checkbox
              ml={4}
              isChecked={isActive}
              onChange={handleCheckboxChange}
            >
              激活{' '}
              {instanceId ? `客服 ${instanceId} 设置` : `应用 ${appName} 设置`}
            </Checkbox>
            <Text color="gray.500" fontSize="sm">
              请注意：激活设置后，设置才会生效
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody position="relative" overflowY="auto" maxHeight="60vh">
            {!isActive && (
              <Flex
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                backgroundColor="rgba(0, 0, 0, 0.5)"
                justifyContent="center"
                alignItems="center"
                zIndex="1"
              >
                <Text color="white" fontSize="lg">
                  请先激活设置
                </Text>
              </Flex>
            )}
            <Box
              opacity={isActive ? 1 : 0.4}
              pointerEvents={isActive ? 'auto' : 'none'}
            >
              <Tabs variant="enclosed" isFitted>
                <TabList>
                  <Tab>通用设置</Tab>
                  <Tab>AI 配置</Tab>
                  <Tab>插件设置</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <GeneralSettings appId={appId} instanceId={instanceId} />
                  </TabPanel>
                  <TabPanel>
                    <LLMSettings appId={appId} instanceId={instanceId} />
                  </TabPanel>
                  <TabPanel>
                    <PluginSettings appId={appId} instanceId={instanceId} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
};

export default React.memo(SettingsModal);
