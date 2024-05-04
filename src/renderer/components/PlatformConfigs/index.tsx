import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  ModalBody,
  Button,
  Stack,
  Skeleton,
  useToast,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  getPlatformList,
  getPlatformSetting,
  updatePlatformSetting,
} from '../../services/platform/controller';
import BaseSettings from './Base';
import WechatSettings from './Wechat';

interface PlatformSettingsProps {
  platformId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PlatformSettings: React.FC<PlatformSettingsProps> = ({
  platformId,
  isOpen,
  onClose,
}) => {
  const toast = useToast();

  const { data, isLoading: isPlatformsLoading } = useQuery(
    ['platformList'],
    getPlatformList,
  );

  const { data: platformSettingData, isLoading: isPlatformSettingLoading } =
    useQuery(['platformSetting', platformId], () =>
      getPlatformSetting(platformId),
    );

  const [hasLoaded, setHasLoaded] = useState(false);
  const [platformMap, setPlatformMap] = useState<Record<string, any>>({});
  const [localData, setLocalData] = useState<any>({}); // eslint-disable-line

  const getPlatformName = (pid: string) => {
    const platform = platformMap[pid];
    if (!platform) return '';
    return platform.name;
  };

  useEffect(() => {
    if (!data) return;
    const map = data.data.reduce((acc: Record<string, any>, platform: any) => {
      acc[platform.id] = platform;
      return acc;
    }, {});
    setPlatformMap(map);
  }, [data]);

  useEffect(() => {
    if (platformSettingData && platformSettingData.data) {
      if (typeof platformSettingData.data === 'string') {
        setLocalData(JSON.parse(platformSettingData.data));
      } else {
        setLocalData(platformSettingData.data);
      }
    }
  }, [platformSettingData]);

  if (isPlatformsLoading || isPlatformSettingLoading) {
    return (
      <Stack m={10}>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  const onChange = (settings: any) => {
    setLocalData(settings);
  };

  const getSettings = () => {
    switch (platformId) {
      case 'win_wechat':
        return <WechatSettings baseData={localData} onChange={onChange} />;
      default:
        return <BaseSettings baseData={localData} onChange={onChange} />;
    }
  };

  const confirm = async () => {
    try {
      setHasLoaded(true);
      await updatePlatformSetting({
        platformId,
        settings: localData,
      });
      toast({
        title: '保存成功',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      onClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : JSON.stringify(e);
      toast({
        title: '保存失败',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setHasLoaded(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{getPlatformName(platformId)} 平台设置</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{getSettings()}</ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={confirm}
            isLoading={hasLoaded}
          >
            保存配置
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PlatformSettings;
