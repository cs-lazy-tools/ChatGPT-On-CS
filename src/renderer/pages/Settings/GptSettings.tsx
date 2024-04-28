import React, { useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  FormControl,
  FormLabel,
  Switch,
  Input,
  Select,
  Highlight,
  Box,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  HStack,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useSettings } from './SettingsContext';
import { checkGptHealth } from '../../services/platform/controller';

const GptSettings = () => {
  const { gptSettings, setGptSettings } = useSettings();
  const [show, setShow] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // 新增状态标识是否加载完成
  const toast = useToast();

  const handleCheckGptHealth = async () => {
    let health = false;
    let message = '';
    try {
      setIsLoaded(true); // 新增标识已加载完成
      const data = await checkGptHealth({
        base_url: gptSettings.gptAddress,
        key: gptSettings.apiKey,
        use_dify: gptSettings.useDify,
        model: gptSettings.model,
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

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box
              flex="1"
              textAlign="left"
              fontSize={'large'}
              fontWeight={'bold'}
            >
              GPT 设置
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="useLazyTools" mb="0">
              使用 Dify
            </FormLabel>
            <Switch
              id="useLazyTools"
              isChecked={gptSettings.useDify}
              onChange={(e) =>
                setGptSettings({
                  ...gptSettings,
                  useDify: e.target.checked,
                })
              }
            />
          </FormControl>

          <>
            <FormControl>
              <FormLabel htmlFor="gptAddress" mt="8px">
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
              <Input
                id="gptAddress"
                value={gptSettings.gptAddress}
                onChange={(e) =>
                  setGptSettings({
                    ...gptSettings,
                    gptAddress: e.target.value,
                  })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="model" mt="8px">
                使用的模型
              </FormLabel>
              <Select
                id="model"
                value={gptSettings.model}
                onChange={(e) =>
                  setGptSettings({
                    ...gptSettings,
                    model: e.target.value,
                  })
                }
              >
                <option value="gpt3">GPT-3</option>
                <option value="gpt3.5">GPT-3.5</option>
                <option value="gpt4">GPT-4</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="temperature" mt="8px">
                Temperature(可选): {gptSettings.temperature}
              </FormLabel>
              <Slider
                min={0}
                max={1}
                step={0.05}
                id="temperature"
                value={gptSettings.temperature}
                onChange={(value) => {
                  setGptSettings({
                    ...gptSettings,
                    temperature: value,
                  });
                }}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="topP" mt="8px">
                Top P(可选): {gptSettings.topP}
              </FormLabel>
              <Slider
                min={0}
                max={1}
                step={0.05}
                id="topP"
                value={gptSettings.topP}
                onChange={(value) => {
                  setGptSettings({
                    ...gptSettings,
                    topP: value,
                  });
                }}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>

            <FormControl>
              <HStack mb="4" mt="8px">
                <FormLabel htmlFor="stream" width="30%">
                  Stream(可选)
                </FormLabel>
                <Switch
                  id="stream"
                  isChecked={gptSettings.stream}
                  onChange={(e) => {
                    setGptSettings({
                      ...gptSettings,
                      stream: e.target.checked,
                    });
                  }}
                />
              </HStack>
            </FormControl>
          </>

          <FormControl>
            <FormLabel htmlFor="apiKey">API Key</FormLabel>
            <InputGroup size="md">
              <Input
                id="apiKey"
                pr="4.5rem"
                type={show ? 'text' : 'password'}
                value={gptSettings.apiKey}
                onChange={(e) => {
                  setGptSettings({ ...gptSettings, apiKey: e.target.value });
                }}
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
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default GptSettings;
