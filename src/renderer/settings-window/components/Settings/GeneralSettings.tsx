import React, { useEffect, useState } from 'react';
import { FiHelpCircle, FiFolder } from 'react-icons/fi';
import {
  Box,
  Button,
  Icon,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Divider,
  Text,
  Tooltip,
  useToast,
  Stack,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  getConfig,
  updateConfig,
} from '../../../common/services/platform/controller';
import { GenericConfig } from '../../../common/services/platform/platform.d';

const GeneralSettings = ({
  appId,
  instanceId,
  style,
}: {
  appId?: string;
  instanceId?: string;
  style?: React.CSSProperties;
}) => {
  const toast = useToast();
  const { data, isLoading } = useQuery(
    ['config', 'generic', appId, instanceId],
    async () => {
      try {
        const resp = await getConfig({
          appId,
          instanceId,
          type: 'generic',
        });
        return resp;
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

        return null;
      }
    },
  );

  const [config, setConfig] = useState<GenericConfig | null>(null);

  useEffect(() => {
    if (data) {
      const obj = data.data as GenericConfig;
      setConfig(obj);
    }
  }, [data]);

  const handleUpdateConfig = async (newConfig: Partial<GenericConfig>) => {
    if (!config) return;
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    try {
      await updateConfig({
        appId,
        instanceId,
        type: 'generic',
        cfg: updatedConfig,
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
  };

  const getReplySpeedStr = () => {
    if (!config) return '0 秒';
    if (config.replyRandomSpeed === 0) {
      // 保留两位小数
      return `${config.replySpeed.toFixed(2)} 秒`;
    }

    return `${config.replySpeed.toFixed(2)} 秒 ~ ${(config.replySpeed + config.replyRandomSpeed).toFixed(2)} 秒`;
  };

  const selectFolderPath = () => {
    window.electron.ipcRenderer.sendMessage('select-directory');
    window.electron.ipcRenderer.once('selected-directory', (path) => {
      const selectedPath = path as string[];
      handleUpdateConfig({ savePath: selectedPath[0] });
    });
  };

  const openSelectedFolder = () => {
    if (!config) return;

    if (config.savePath) {
      window.electron.ipcRenderer.sendMessage(
        'open-directory',
        config.savePath,
      );
    } else {
      toast({
        position: 'top',
        title: '未选择文件夹',
        description: '请先选择一个文件夹路径。',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading || !data || !config) {
    return (
      <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  return (
    <VStack spacing="4" align="start" style={style}>
      <Checkbox
        mr={4}
        isChecked={config.extractPhone}
        onChange={(e) => handleUpdateConfig({ extractPhone: e.target.checked })}
      >
        提取手机号
      </Checkbox>
      <Checkbox
        mr={4}
        isChecked={config.extractProduct}
        onChange={(e) =>
          handleUpdateConfig({ extractProduct: e.target.checked })
        }
      >
        提取咨询商品名
      </Checkbox>

      <FormControl mt={3}>
        <FormLabel>提取内容存储路径</FormLabel>
        <Flex>
          <Input
            isReadOnly
            value={config.savePath}
            placeholder="选择文件夹路径"
          />
          <Button ml={2} onClick={selectFolderPath}>
            选择
          </Button>
        </Flex>
      </FormControl>

      <Button
        leftIcon={<FiFolder />}
        my={3}
        w={'100%'}
        onClick={openSelectedFolder}
      >
        打开本地文件夹
      </Button>

      <Divider />

      <FormControl mt={3}>
        <FormLabel>
          {' '}
          <Tooltip label="接口报错，或者没有匹配到回复时的返回值">
            <Text mb="8px">默认回复</Text>
          </Tooltip>
        </FormLabel>
        <Flex>
          <Input
            placeholder="输入默认回复内容"
            value={config.defaultReply}
            onChange={(e) =>
              handleUpdateConfig({ defaultReply: e.target.value })
            }
          />
        </Flex>
      </FormControl>

      <Tooltip label="回复等待时间，当设置了随机时间则，等待时间为 “固定等待时间” + “随机等待时间”">
        <Text mb="8px">回复等待时间（单位秒）: {` ${getReplySpeedStr()}`}</Text>
      </Tooltip>
      <RangeSlider
        min={0}
        max={5}
        step={0.1}
        colorScheme="pink"
        defaultValue={[
          config.replySpeed !== undefined ? config.replySpeed : 0,
          config.replyRandomSpeed !== undefined ? config.replyRandomSpeed : 0,
        ]}
        onChangeEnd={([replySpeed, replyRandomSpeed]) =>
          handleUpdateConfig({ replySpeed, replyRandomSpeed })
        }
      >
        <RangeSliderTrack>
          <RangeSliderFilledTrack />
        </RangeSliderTrack>
        <Tooltip label="固定等待时间">
          <RangeSliderThumb index={0} />
        </Tooltip>
        <Tooltip label="随机等待时间">
          <RangeSliderThumb index={1} />
        </Tooltip>
      </RangeSlider>

      <Flex mt={3}>
        <Text mb="8px" mr={3}>
          上下文消息数: {config.contextCount}
        </Text>
        <Tooltip label="使用 GPT 回复会指定的消息数量传递给 GPT 去生成下一条回复，数量设置的越大回复的速度越慢">
          <Box color={'gray.500'}>
            <Icon as={FiHelpCircle} w={6} h={6} />
          </Box>
        </Tooltip>
      </Flex>
      <Slider
        min={1}
        max={20}
        step={1}
        value={config.contextCount}
        onChange={(contextCount) => handleUpdateConfig({ contextCount })}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>

      <Flex mt={3}>
        <Text mb="8px" mr={3}>
          等待人工间隔: {config.waitHumansTime}秒
        </Text>
        <Tooltip label="多长时间没有回复则通知人工接入，单位秒">
          <Box color={'gray.500'}>
            <Icon as={FiHelpCircle} w={6} h={6} />
          </Box>
        </Tooltip>
      </Flex>
      <Slider
        min={10}
        max={180}
        step={10}
        value={config.waitHumansTime}
        onChange={(waitHumansTime) => handleUpdateConfig({ waitHumansTime })}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </VStack>
  );
};

export default GeneralSettings;
