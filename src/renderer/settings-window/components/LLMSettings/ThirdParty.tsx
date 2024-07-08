import React, { ChangeEvent } from 'react';
import {
  FormControl,
  FormLabel,
  Select,
  Input,
  Highlight,
  InputGroup,
  InputRightElement,
  Button,
  Text,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { LLMConfig } from '../../../common/services/platform/platform';
import { ModelList, LLMTypeList } from '../../../common/utils/constants';

interface ThirdPartyInterfaceProps {
  config: LLMConfig;
  handleUpdateConfig: (newConfig: Partial<LLMConfig>) => void;
  handleBaseURLChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleCheckHealth: () => void;
  reply: string;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const ThirdPartyInterface: React.FC<ThirdPartyInterfaceProps> = ({
  config,
  handleUpdateConfig,
  handleBaseURLChange,
  handleCheckHealth,
  reply,
  show,
  setShow,
}) => (
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
        <Highlight query="/v1" styles={{ px: '1', py: '1', bg: 'orange.100' }}>
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

    {reply && (
      <>
        <Text>回复内容</Text>
        <Text>{reply}</Text>
      </>
    )}
  </>
);

export default ThirdPartyInterface;
