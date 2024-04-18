import React from 'react';
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
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useSettings } from './SettingsContext';

const GptSettings = () => {
  const { gptSettings, setGptSettings } = useSettings();
  const [show, setShow] = React.useState(false);

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
              使用懒人百宝箱
            </FormLabel>
            <Switch
              id="useLazyTools"
              isChecked={gptSettings.useLazyTools}
              onChange={(e) =>
                setGptSettings({
                  ...gptSettings,
                  useLazyTools: e.target.checked,
                })
              }
            />
          </FormControl>

          {!gptSettings.useLazyTools && (
            <>
              <FormControl>
                <FormLabel htmlFor="gptAddress" mt="8px">
                  <Highlight
                    query="/v1"
                    styles={{ px: '1', py: '1', bg: 'orange.100' }}
                  >
                    GPT 地址设置（尾部需要加上 /v1）
                  </Highlight>
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
          )}

          <FormControl>
            <FormLabel htmlFor="apiKey">API Key</FormLabel>
            {gptSettings.useLazyTools ? (
              <Input
                id="lazyKey"
                type="password"
                value={gptSettings.apiKey}
                onChange={(e) =>
                  setGptSettings({ ...gptSettings, apiKey: e.target.value })
                }
              />
            ) : (
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
            )}
          </FormControl>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default GptSettings;
