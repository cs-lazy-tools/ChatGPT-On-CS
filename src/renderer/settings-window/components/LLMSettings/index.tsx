import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  FormControl,
  FormLabel,
  Select,
  VStack,
  Text,
  useToast,
  Stack,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  getConfig,
  updateConfig,
  checkGptHealth,
} from '../../../common/services/platform/controller';
import { LLMConfig } from '../../../common/services/platform/platform';
import ThirdPartyInterface from './ThirdParty';

const LazybonesToolbox: React.FC = () => <Text>懒人百宝箱接入的内容</Text>;

const UseCoze: React.FC = () => <Text>使用 Coze 的内容</Text>;

interface LLMSettingsProps {
  appId?: string;
  instanceId?: string;
}

const LLMSettings: React.FC<LLMSettingsProps> = ({ appId, instanceId }) => {
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [reply, setReply] = useState('');
  const [selectedOption, setSelectedOption] = useState('thirdParty');

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

  const handleBaseURLChange = (e: ChangeEvent<HTMLInputElement>) => {
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

      setReply(resp.message);

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
      <FormControl>
        <FormLabel htmlFor="option">选择选项</FormLabel>
        <Select
          id="option"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option value="lazybonesToolbox">懒人百宝箱接入</option>
          <option value="useCoze">使用 Coze</option>
          <option value="thirdParty">三方接口接入</option>
        </Select>
      </FormControl>

      {selectedOption === 'thirdParty' && (
        <ThirdPartyInterface
          config={config}
          handleUpdateConfig={handleUpdateConfig}
          handleBaseURLChange={handleBaseURLChange}
          handleCheckHealth={handleCheckHealth}
          reply={reply}
          show={show}
          setShow={setShow}
        />
      )}

      {selectedOption === 'lazybonesToolbox' && <LazybonesToolbox />}

      {selectedOption === 'useCoze' && <UseCoze />}
    </VStack>
  );
};

export default LLMSettings;
