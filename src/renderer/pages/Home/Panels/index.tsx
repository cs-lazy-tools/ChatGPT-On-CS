import React, { useEffect, useState } from 'react';
import { Checkbox, Stack, HStack, Tooltip } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../../../hooks/useToast';
import { getConfig, updateConfig } from '../../../services/platform/controller';
import { DriverConfig } from '../../../services/platform/platform.d';
import { useWebSocketContext } from '../../../hooks/useBroadcastContext';

const Panels = () => {
  const { toast } = useToast();
  const { registerEventHandler } = useWebSocketContext();
  const [driverSettings, setDriverSettings] = useState<DriverConfig>({
    hasPaused: true,
    hasKeywordMatch: false,
    hasUseGpt: false,
    hasMouseClose: true,
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

  useEffect(() => {
    const unregister = registerEventHandler((message) => {
      if (message.event === 'has_paused') {
        setDriverSettings({
          ...driverSettings,
          hasPaused: true,
        });

        toast({
          title: '自动回复已暂停',
          status: 'info',
          position: 'top',
          duration: 5000,
          isClosable: true,
        });
      }
    });

    // 组件卸载时注销事件处理器
    return () => unregister();
  }, [registerEventHandler]); // eslint-disable-line

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

      // 检查是否是 hasPaused 变更
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
    <>
      <Stack spacing={4}>
        <HStack width="full" alignItems="center">
          <Checkbox
            mr={4}
            isChecked={driverSettings.hasPaused}
            onChange={(e) =>
              handleUpdateConfig({ hasPaused: e.target.checked })
            }
          >
            <Tooltip label="暂停软件后，将不再自动回复消息">暂停软件</Tooltip>
          </Checkbox>
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
        <HStack width="full" alignItems="center">
          <Checkbox
            isChecked={driverSettings.hasMouseClose}
            onChange={(e) =>
              handleUpdateConfig({ hasMouseClose: e.target.checked })
            }
          >
            <Tooltip label="是否开启鼠标移动时，自动暂停自动客服">
              鼠标移动自动暂停
            </Tooltip>
          </Checkbox>
        </HStack>
      </Stack>
    </>
  );
};

export default React.memo(Panels);
