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
} from '@chakra-ui/react';
import { getVersionInfo } from '../../services/system/controller';
import Markdown from '../Markdown';

const Updater = () => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{
    version: string;
    url: string;
    description: string;
  } | null>(null);
  const [currentVersion, setCurrentVersion] = useState('');

  useEffect(() => {
    (async () => {
      const cv = window.electron.ipcRenderer.get('get-version');
      const info = await getVersionInfo(cv);
      if (info) {
        setUpdateInfo(info);
        setCurrentVersion(cv);
        setIsUpdateModalOpen(true);
      }
    })();
  }, []);

  // 确认更新则跳转到下载链接
  const confirmUpdate = () => {
    if (updateInfo) {
      window.electron.ipcRenderer.sendMessage('open-url', updateInfo.url);
    }
  };

  return (
    <>
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>版本更新</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {updateInfo && (
              <>
                <Text>
                  当前版本是 {currentVersion} 检查到有最新版本{' '}
                  {updateInfo?.version} 请问您是否立即更新？
                </Text>

                <Box mt="20px">
                  <Markdown content={updateInfo?.description} />
                </Box>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={confirmUpdate}>
              立即更新
            </Button>
            <Button variant="ghost" onClick={() => setIsUpdateModalOpen(false)}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default React.memo(Updater);
