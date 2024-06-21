import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
} from '@chakra-ui/react';
import { getVersionInfo } from '../../../common/services/system/controller';
import Markdown from '../../../common/components/Markdown';

const Updater = () => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updates, setUpdates] = useState<
    {
      version: string;
      url: string;
      description: string;
    }[]
  >([]);
  const [currentVersion, setCurrentVersion] = useState('');

  useEffect(() => {
    (async () => {
      const cv = window.electron.ipcRenderer.get('get-version');
      const versionUpdates = await getVersionInfo(cv);
      if (versionUpdates.length > 0) {
        setUpdates(versionUpdates);
        setCurrentVersion(cv);
        setIsUpdateModalOpen(true);
      }
    })();
  }, []);

  // 确认更新则跳转到最新版本的下载链接
  const confirmUpdate = () => {
    const latestVersion = updates[0]; // 假设第一个总是最新版本
    if (latestVersion) {
      window.electron.ipcRenderer.sendMessage('open-url', latestVersion.url);
    }
  };

  return (
    <Modal
      isOpen={isUpdateModalOpen}
      onClose={() => setIsUpdateModalOpen(false)}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>版本更新</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>当前版本是 {currentVersion}. 检查到以下更新：</Text>
          <VStack spacing={4} mt="20px">
            {updates.map((update, index) => (
              <Box key={index}>
                <Markdown content={update.description} />
              </Box>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={confirmUpdate}>
            立即更新到最新版本
          </Button>
          <Button variant="ghost" onClick={() => setIsUpdateModalOpen(false)}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default React.memo(Updater);
