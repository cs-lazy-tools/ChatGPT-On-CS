import React from 'react';
import { FiHelpCircle, FiFolder } from 'react-icons/fi';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Icon,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  useToast,
  Tooltip,
} from '@chakra-ui/react';
import { useSettings } from './SettingsContext';

const CustomerServiceSettings = () => {
  const toast = useToast();
  const { customerServiceSettings, setCustomerServiceSettings } = useSettings();

  const selectFolderPath = () => {
    window.electron.ipcRenderer.sendMessage('select-directory');
    window.electron.ipcRenderer.once('selected-directory', (path) => {
      const selectedPath = path as string[];
      setCustomerServiceSettings({
        ...customerServiceSettings,
        folderPath: selectedPath[0],
      });
    });
  };

  const openSelectedFolder = () => {
    if (customerServiceSettings.folderPath) {
      window.electron.ipcRenderer.sendMessage(
        'open-directory',
        customerServiceSettings.folderPath,
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
              客服设置
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Checkbox
            isChecked={customerServiceSettings.extractPhone}
            onChange={(e) =>
              setCustomerServiceSettings({
                ...customerServiceSettings,
                extractPhone: e.target.checked,
              })
            }
            mr={4}
          >
            提取手机号
          </Checkbox>
          <Checkbox
            isChecked={customerServiceSettings.extractProduct}
            onChange={(e) => {
              setCustomerServiceSettings({
                ...customerServiceSettings,
                extractProduct: e.target.checked,
              });
            }}
            mr={4}
          >
            提取咨询商品名
          </Checkbox>

          <FormControl mt={3}>
            <FormLabel>提取内容存储路径</FormLabel>
            <Flex>
              <Input
                value={customerServiceSettings.folderPath}
                isReadOnly
                placeholder="选择文件夹路径"
              />
              <Button ml={2} onClick={selectFolderPath}>
                选择
              </Button>
            </Flex>
          </FormControl>

          <Button
            onClick={openSelectedFolder}
            leftIcon={<FiFolder />}
            my={3}
            w={'100%'}
          >
            打开本地文件夹
          </Button>

          <Text mb="8px">
            回复等待时间（单位秒）: {customerServiceSettings.replySpeed}秒
          </Text>
          <Slider
            min={0}
            max={10}
            step={0.1}
            value={customerServiceSettings.replySpeed}
            onChange={(value) =>
              setCustomerServiceSettings({
                ...customerServiceSettings,
                replySpeed: value,
              })
            }
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>

          <Flex mt={3}>
            <Text mb="8px" mr={3}>
              上下文消息数:{' '}
              {customerServiceSettings.mergeUnprocessedMessagesCount}
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
            value={customerServiceSettings.mergeUnprocessedMessagesCount}
            onChange={(value) =>
              setCustomerServiceSettings({
                ...customerServiceSettings,
                mergeUnprocessedMessagesCount: value,
              })
            }
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>

          <Flex mt={3}>
            <Text mb="8px" mr={3}>
              等待人工间隔: {customerServiceSettings.manualInterventionInterval}
              秒
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
            value={customerServiceSettings.manualInterventionInterval}
            onChange={(value) =>
              setCustomerServiceSettings({
                ...customerServiceSettings,
                manualInterventionInterval: value,
              })
            }
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>

          {/* <Flex mt={3}>
            <Text mb="8px" mr={3}>
              关键字触发间隔: {customerServiceSettings.keywordTriggerInterval}秒
            </Text>
            <Tooltip label="关键字触发间隔">
              <Box color={'gray.500'}>
                <Icon as={FiHelpCircle} w={6} h={6} />
              </Box>
            </Tooltip>
          </Flex>
          <Slider
            min={10}
            max={180}
            step={10}
            value={customerServiceSettings.keywordTriggerInterval}
            onChange={(value) =>
              setCustomerServiceSettings({
                ...customerServiceSettings,
                keywordTriggerInterval: value,
              })
            }
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider> */}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default CustomerServiceSettings;
