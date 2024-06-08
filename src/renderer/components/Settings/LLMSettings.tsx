import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Select,
  Input,
  InputLeftAddon,
  Highlight,
  InputGroup,
  InputRightElement,
  Button,
  VStack,
  Box,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const LLMSettings = () => {
  const [show, setShow] = useState(false);
  const [llmType, setLlmType] = useState('gpt');
  const [model, setModel] = useState('model1');
  const [customModel, setCustomModel] = useState('');

  return (
    <VStack spacing="4" align="start">
      <>
        <FormControl>
          <FormLabel htmlFor="llmType">选择大模型类型</FormLabel>
          <Select
            id="llmType"
            placeholder="选择大模型类型"
            value={llmType}
            onChange={(e) => setLlmType(e.target.value)}
          >
            <option value="gpt">GPT</option>
            <option value="bert">BERT</option>
            <option value="t5">T5</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="model">选择或输入模型</FormLabel>
          <Select
            id="model"
            placeholder="选择模型"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="model1">Model 1</option>
            <option value="model2">Model 2</option>
            <option value="model3">Model 3</option>
            <option value="custom">自定义输入</option>
          </Select>
          {model === 'custom' && (
            <Box mt="2">
              <Input
                placeholder="输入自定义模型名称"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
              />
            </Box>
          )}
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="gptAddress" mt="8px">
            <Highlight
              query="/v1"
              styles={{ px: '1', py: '1', bg: 'orange.100' }}
            >
              API 地址设置（尾部需要加上 /v1）
            </Highlight>

            <Button size="sm" colorScheme="blue" ml="4" loadingText="检查中">
              检查连接
            </Button>
          </FormLabel>
          <InputGroup size="sm">
            <InputLeftAddon>http(s)://</InputLeftAddon>
            <Input id="gptAddress" placeholder="输入站点地址" />
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
      </>
    </VStack>
  );
};

export default LLMSettings;
