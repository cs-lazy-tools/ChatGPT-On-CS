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
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
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

  const getReplySpeedStr = (value: any) => {
    if (Array.isArray(value)) {
      return `${value[0]}秒 ${value[0] !== value[1] ? `~ ${value[1]}秒` : ''}`;
    }
    return `${value}秒`;
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

          <Flex my={3}>
            <Tooltip label="接口报错，或者没有匹配到回复时的返回值">
              <Text mb="8px">默认回复</Text>
            </Tooltip>
            <Input
              placeholder="输入默认回复内容"
              w={'80%'}
              ml={3}
              value={customerServiceSettings.defaultReply}
              onChange={(e) => {
                setCustomerServiceSettings({
                  ...customerServiceSettings,
                  defaultReply: e.target.value,
                });
              }}
            />
          </Flex>
          <Tooltip label="回复等待时间，当设置了随机时间则，等待时间为 “固定等待时间” + “随机等待时间”">
            <Text mb="8px">
              回复等待时间（单位秒）:{' '}
              {getReplySpeedStr(customerServiceSettings.replySpeed)}
            </Text>
          </Tooltip>
          <RangeSlider
            min={0}
            max={5}
            step={0.1}
            colorScheme="pink"
            defaultValue={[0, 0]}
            value={
              Array.isArray(customerServiceSettings.replySpeed)
                ? customerServiceSettings.replySpeed
                : [0, 0]
            }
            onChange={(value) => {
              setCustomerServiceSettings({
                ...customerServiceSettings,
                replySpeed: value,
              });
            }}
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
              上下文消息数: {customerServiceSettings.contextCount}
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
            value={customerServiceSettings.contextCount}
            onChange={(value) =>
              setCustomerServiceSettings({
                ...customerServiceSettings,
                contextCount: value,
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
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default CustomerServiceSettings;
