import React from 'react';
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
  Text,
  Tooltip,
} from '@chakra-ui/react';

const GeneralSettings = () => (
  <VStack spacing="4" align="start">
    <Checkbox mr={4}>提取手机号</Checkbox>
    <Checkbox mr={4}>提取咨询商品名</Checkbox>

    <FormControl mt={3}>
      <FormLabel>提取内容存储路径</FormLabel>
      <Flex>
        <Input isReadOnly placeholder="选择文件夹路径" />
        <Button ml={2}>选择</Button>
      </Flex>
    </FormControl>

    <Button leftIcon={<FiFolder />} my={3} w={'100%'}>
      打开本地文件夹
    </Button>

    <Flex my={3}>
      <Tooltip label="接口报错，或者没有匹配到回复时的返回值">
        <Text mb="8px">默认回复</Text>
      </Tooltip>
      <Input placeholder="输入默认回复内容" w={'80%'} ml={6} />
    </Flex>
    <Tooltip label="回复等待时间，当设置了随机时间则，等待时间为 “固定等待时间” + “随机等待时间”">
      <Text mb="8px">回复等待时间（单位秒）: </Text>
    </Tooltip>
    <RangeSlider
      min={0}
      max={5}
      step={0.1}
      colorScheme="pink"
      defaultValue={[0, 0]}
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
        上下文消息数: 12
      </Text>
      <Tooltip label="使用 GPT 回复会指定的消息数量传递给 GPT 去生成下一条回复，数量设置的越大回复的速度越慢">
        <Box color={'gray.500'}>
          <Icon as={FiHelpCircle} w={6} h={6} />
        </Box>
      </Tooltip>
    </Flex>
    <Slider min={1} max={20} step={1}>
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <SliderThumb />
    </Slider>

    <Flex mt={3}>
      <Text mb="8px" mr={3}>
        等待人工间隔: {10}秒
      </Text>
      <Tooltip label="多长时间没有回复则通知人工接入，单位秒">
        <Box color={'gray.500'}>
          <Icon as={FiHelpCircle} w={6} h={6} />
        </Box>
      </Tooltip>
    </Flex>
    <Slider min={10} max={180} step={10}>
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <SliderThumb />
    </Slider>
  </VStack>
);

export default GeneralSettings;
