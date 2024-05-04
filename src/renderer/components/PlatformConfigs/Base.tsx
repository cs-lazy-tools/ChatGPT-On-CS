import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  InputGroup,
  InputRightElement,
  Tooltip,
  Highlight,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { isEqual } from 'lodash';
import { checkGptHealth } from '../../services/platform/controller';

// 定义一个 data 的类型
export interface DataType {
  active: boolean;
  useDify: boolean;
  proxyAddress: string;
  apiKey: string;
  model: string;
  defaultReply: string;
  contextCount: number;
}

type BaseSettingsProps = {
  // 回调函数
  onChange?: (settings: DataType) => void;
  baseData?: DataType;
};

const BaseSettings = ({ onChange, baseData }: BaseSettingsProps) => {
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // 新增状态标识是否加载完成
  const [localData, setLocalData] = useState<DataType>({
    active: false,
    useDify: false,
    proxyAddress: '',
    apiKey: '',
    defaultReply: '',
    contextCount: 1,
    model: 'gpt3',
  });

  const handleCheckGptHealth = async () => {
    let health = false;
    let message = '';
    try {
      setIsLoaded(true); // 新增标识已加载完成
      const data = await checkGptHealth({
        base_url: localData.proxyAddress,
        key: localData.apiKey,
        use_dify: localData.useDify,
        model: localData.model,
      });
      health = data.status;
      message = data.message;
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoaded(false); // 新增标识已加载完成
    }

    if (health) {
      toast({
        position: 'top',
        title: 'GPT 服务正常',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        position: 'top',
        title: `请检查 GPT 服务设置 ${message}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const setLocalDataD = (data: DataType) => {
    setLocalData({
      active: data?.active || false,
      useDify: data?.useDify || false,
      proxyAddress: data?.proxyAddress || '',
      apiKey: data?.apiKey || '',
      defaultReply: data?.defaultReply || '',
      contextCount: data?.contextCount || 1,
      model: data?.model || 'gpt3',
    });
  };

  // 同步 baseData 到 localData
  useEffect(() => {
    if (baseData && !isEqual(localData, baseData)) {
      setLocalDataD(baseData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseData]);

  // 更新状态并通知外部变更
  const updateData = (data: Partial<DataType>) => {
    const newData = { ...localData, ...data };
    setLocalDataD(newData);
    if (onChange && !isEqual(localData, newData)) {
      onChange(newData);
    }
  };

  return (
    <Box mb={5}>
      <FormControl display="flex" alignItems="center" mb="3">
        <FormLabel htmlFor="active" mb="0">
          启用配置
        </FormLabel>
        <Switch
          id="active"
          isChecked={localData.active}
          onChange={() => updateData({ active: !localData.active })}
        />
      </FormControl>
      <FormControl display="flex" alignItems="center" mb={5}>
        <FormLabel htmlFor="useDify" mb="0">
          使用 Dify
        </FormLabel>
        <Switch
          id="useDify"
          isChecked={localData.useDify}
          onChange={() => updateData({ useDify: !localData.useDify })}
        />
      </FormControl>
      <FormControl isRequired>
        <Tooltip label="设置后则不使用全局设置的 OpenAI 地址">
          <FormLabel>
            <Highlight
              query="/v1"
              styles={{ px: '1', py: '1', bg: 'orange.100' }}
            >
              GPT 地址设置（尾部需要加上 /v1）
            </Highlight>
            <Button
              size="sm"
              colorScheme="blue"
              ml="4"
              onClick={handleCheckGptHealth}
              loadingText="检查中"
              isLoading={isLoaded}
            >
              检查连接
            </Button>
          </FormLabel>
        </Tooltip>
        <Input
          type="url"
          placeholder="请输入代理地址"
          value={localData.proxyAddress}
          onChange={(e) => updateData({ proxyAddress: e.target.value })}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel htmlFor="apiKey">API Key</FormLabel>
        <InputGroup size="md">
          <Input
            id="apiKey"
            pr="4.5rem"
            type={show ? 'text' : 'password'}
            placeholder="请输入密钥"
            value={localData.apiKey}
            onChange={(e) => updateData({ apiKey: e.target.value })}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={() => {
                setShow(!show);
              }}
            >
              {show ? <ViewIcon /> : <ViewOffIcon />}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      {!localData.useDify && (
        <FormControl>
          <FormLabel htmlFor="model" mt="8px">
            使用的模型
          </FormLabel>
          <Input
            id="model"
            value={localData.model}
            onChange={(e) =>
              updateData({
                model: e.target.value,
              })
            }
          />
        </FormControl>
      )}

      <FormControl mt={4} isRequired>
        <Tooltip label="接口报错，或者没有匹配到回复时的返回值">
          <FormLabel htmlFor="apiKey">默认回复</FormLabel>
        </Tooltip>

        <Input
          placeholder="输入默认回复内容"
          value={localData.defaultReply}
          onChange={(e) => updateData({ defaultReply: e.target.value })}
        />
      </FormControl>

      <FormControl mt={4}>
        <Tooltip label="使用 GPT 回复会指定的消息数量传递给 GPT 去生成下一条回复，数量设置的越大回复的速度越慢">
          <FormLabel htmlFor="contextCount">
            上下文消息数（{localData.contextCount}）
          </FormLabel>
        </Tooltip>
        <Slider
          min={1}
          max={7}
          step={1}
          value={localData.contextCount}
          onChange={(value) => updateData({ contextCount: value })}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </FormControl>
    </Box>
  );
};

export default BaseSettings;
