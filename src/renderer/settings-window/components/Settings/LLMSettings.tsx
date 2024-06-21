import React, { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  Select,
  Input,
  Highlight,
  InputGroup,
  InputRightElement,
  Button,
  VStack,
  Text,
  useToast,
  Stack,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import {
  getConfig,
  updateConfig,
  checkGptHealth,
} from '../../../common/services/platform/controller';
import { LLMConfig } from '../../../common/services/platform/platform.d';
import { ModelList, LLMTypeList } from '../../../common/utils/constants';

const LLMSettings = ({
  appId,
  instanceId,
}: {
  appId?: string;
  instanceId?: string;
}) => {
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [reply, setReply] = useState(''); // 新增一个状态用于展示回复内容

  const { data, isLoading } = useQuery(
    ['config', 'llm', appId, instanceId],
    async () => {
      try {
        const resp = await getConfig({
          appId,
          instanceId,
          type: 'llm',
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

  const [config, setConfig] = useState<LLMConfig>({
    appId: '',
    instanceId: '',
    llmType: '',
    model: '',
    baseUrl: '',
    key: '',
  });

  useEffect(() => {
    if (data) {
      const obj = data.data as LLMConfig;
      setConfig(obj);
    }
  }, [data]);

  const handleUpdateConfig = async (newConfig: Partial<LLMConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    try {
      await updateConfig({
        appId,
        instanceId,
        type: 'llm',
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

  const handleBaseURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      value = `https://${value}`;
    }

    handleUpdateConfig({ baseUrl: value });
  };

  const handleCheckHealth = async () => {
    try {
      if (!config) return;
      const resp = await checkGptHealth(config);
      if (!resp.status) {
        throw new Error(resp.message);
      }

      setReply(resp.message); // 设置回复内容

      toast({
        title: '连接成功',
        position: 'top',
        description: 'GPT 连接成功',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      const errormsg =
        error instanceof Error ? error.message : JSON.stringify(error);
      toast({
        title: '连接失败',
        position: 'top',
        description: errormsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  return (
    <VStack spacing="4" align="start">
      <>
        <FormControl>
          <FormLabel htmlFor="llmType">选择大模型类型</FormLabel>
          <Select
            id="llmType"
            placeholder="选择大模型类型"
            value={config.llmType}
            onChange={(e) => handleUpdateConfig({ llmType: e.target.value })}
          >
            {LLMTypeList.map((type) => (
              <option key={type.key} value={type.key}>
                {type.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="model">选择或输入模型</FormLabel>
          <InputGroup>
            <Input
              id="model"
              placeholder="选择或输入模型"
              value={config.model}
              onChange={(e) => handleUpdateConfig({ model: e.target.value })}
              list="models"
            />
            <datalist id="models">
              {ModelList.map((model) => (
                <option key={model.key} value={model.key}>
                  {model.name}
                </option>
              ))}
            </datalist>
          </InputGroup>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="gptAddress" mt="8px">
            <Highlight
              query="/v1"
              styles={{ px: '1', py: '1', bg: 'orange.100' }}
            >
              API 地址设置（尾部需要加上 /v1）
            </Highlight>

            <Button
              size="sm"
              colorScheme="blue"
              ml="4"
              loadingText="检查中"
              onClick={handleCheckHealth}
            >
              检查连接
            </Button>
          </FormLabel>
          <InputGroup size="sm">
            <Input
              id="gptAddress"
              value={config.baseUrl}
              placeholder="输入站点地址"
              onChange={handleBaseURLChange}
            />
          </InputGroup>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="apiKey">API Key</FormLabel>
          <InputGroup size="md">
            <Input
              id="apiKey"
              pr="4.5rem"
              type={show ? 'text' : 'password'}
              placeholder="Enter password"
              value={config.key}
              onChange={(e) => handleUpdateConfig({ key: e.target.value })}
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

        {/* 新增一个展示回复内容的块 */}
        {reply && (
          <>
            <Text>回复内容</Text>
            <Text>{reply}</Text>
          </>
        )}
      </>
    </VStack>
  );
};

export default LLMSettings;
