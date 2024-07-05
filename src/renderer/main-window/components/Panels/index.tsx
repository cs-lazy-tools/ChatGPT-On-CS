import React, { useEffect, useState, useCallback } from 'react';
import {
  Stack,
  HStack,
  Tooltip,
  IconButton,
  Text,
  VStack,
  Checkbox,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { FiPause, FiPlay } from 'react-icons/fi'; // 引入播放器图标
import { useToast } from '../../hooks/useToast';
import {
  getConfig,
  updateConfig,
} from '../../../common/services/platform/controller';
import { DriverConfig } from '../../../common/services/platform/platform';
import { useWebSocketContext } from '../../hooks/useBroadcastContext';

const Panels = () => {
  const { toast } = useToast();
  const { registerEventHandler } = useWebSocketContext();
  const [driverSettings, setDriverSettings] = useState<DriverConfig>({
    hasPaused: true,
    hasKeywordMatch: false,
    hasUseGpt: false,
    hasMouseClose: true,
    hasEscClose: true,
    hasTransfer: true,
    hasReplace: true,
  });

  const { data } = useQuery(['config', 'driver'], async () => {
    try {
      const resp = await getConfig({
        type: 'driver',
      });
      return resp;
    } catch (error) {
      toast({
        title: '获取配置失败',
        description: error instanceof Error ? error.message : String(error),
        status: 'error',
      });

      return null;
    }
  });

  const pausedHandler = useCallback(
    (message: any) => {
      if (message.event === 'has_paused') {
        setDriverSettings((prevSettings) => ({
          ...prevSettings,
          hasPaused: true,
        }));

        toast({
          title: '自动回复已暂停',
          status: 'info',
          position: 'top',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [toast],
  );

  useEffect(() => {
    const unregister = registerEventHandler(pausedHandler);

    return () => unregister();
  }, [registerEventHandler, pausedHandler]);

  useEffect(() => {
    if (data) {
      const obj = data.data as DriverConfig;
      setDriverSettings(obj);
    }
  }, [data]);

  const handleUpdateConfig = async (newConfig: Partial<DriverConfig>) => {
    const updatedConfig = { ...driverSettings, ...newConfig };
    setDriverSettings(updatedConfig);
    try {
      await updateConfig({
        type: 'driver',
        cfg: updatedConfig,
      });

      if ('hasPaused' in newConfig) {
        toast({
          title: '更新配置成功',
          description: newConfig.hasPaused
            ? '已经暂停自动回复功能'
            : '已经开启自动回复功能',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
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
  };

  return (
    <Stack spacing={4}>
      <HStack width="full" alignItems="center" justifyContent="space-between">
        <VStack width="35%">
          <Text fontSize="md">
            按下{driverSettings.hasPaused ? '开启' : '关闭'}自动回复
          </Text>
          <IconButton
            icon={driverSettings.hasPaused ? <FiPlay /> : <FiPause />}
            aria-label="Pause/Play"
            size="lg"
            mt={2}
            onClick={() =>
              handleUpdateConfig({ hasPaused: !driverSettings.hasPaused })
            }
            isRound
            colorScheme={driverSettings.hasPaused ? 'green' : 'red'}
          />
        </VStack>
        <VStack width="65%" alignItems="flex-start">
          <HStack>
            <Checkbox
              isChecked={driverSettings.hasKeywordMatch}
              onChange={(e) =>
                handleUpdateConfig({ hasKeywordMatch: e.target.checked })
              }
            >
              <Tooltip label="将优先匹配关键词，未匹配的才去调用 GPT 接口">
                关键词匹配
              </Tooltip>
            </Checkbox>
            <Checkbox
              isChecked={driverSettings.hasUseGpt}
              onChange={(e) =>
                handleUpdateConfig({ hasUseGpt: e.target.checked })
              }
            >
              <Tooltip label="是否开启 GPT 回复，关闭后只会使用关键词回复">
                GPT 回复
              </Tooltip>
            </Checkbox>
          </HStack>
          <HStack>
            <Checkbox
              isChecked={driverSettings.hasTransfer}
              onChange={(e) =>
                handleUpdateConfig({ hasTransfer: e.target.checked })
              }
            >
              <Tooltip label="如果匹配到设定的关键词，将自动转人工">
                关键词转人工
              </Tooltip>
            </Checkbox>
            <Checkbox
              isChecked={driverSettings.hasReplace}
              onChange={(e) =>
                handleUpdateConfig({ hasReplace: e.target.checked })
              }
            >
              <Tooltip label="如果匹配到设定的关键词，将自动替换成自定义的关键词">
                关键词替换
              </Tooltip>
            </Checkbox>
          </HStack>
          <HStack>
            <Checkbox
              isChecked={driverSettings.hasEscClose}
              onChange={(e) =>
                handleUpdateConfig({ hasEscClose: e.target.checked })
              }
            >
              <Tooltip label="当按下 ESC 键时自动暂停">
                按 ESC 键自动暂停
              </Tooltip>
            </Checkbox>
          </HStack>
        </VStack>
      </HStack>
    </Stack>
  );
};

export default React.memo(Panels);
