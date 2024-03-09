import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Text,
  Stack,
  VStack,
  Icon,
  Heading,
  Switch,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Skeleton,
  Tooltip,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { FiHelpCircle } from 'react-icons/fi';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getPlatformList,
  getPlatformSettings,
  updatePlatformSettings,
} from '../../services/platform/controller';
import {
  Platform,
  PlatformSettings as PS,
} from '../../services/platform/platform';
import analytics from '../../services/analytics/index_template';

const PlatformSettings = () => {
  useEffect(() => {
    // 页面访问埋点
    analytics.onEvent('$PageView', {
      $PageName: 'platform',
    });
  }, []);

  const toast = useToast();
  const { data, isLoading: isPlatformsLoading } = useQuery(
    ['platformList'],
    getPlatformList,
  );

  const { data: settingsData, isLoading: isSettingsDataLoading } = useQuery(
    ['platformSettings'],
    getPlatformSettings,
  );

  const updateMutation = useMutation({
    mutationFn: async (newSettings: PS) => {
      await updatePlatformSettings(newSettings);
    },
    onSuccess: () => {
      toast({
        title: '更新成功',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: '更新失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // 初始化配置
  const [settings, setSettings] = useState<{
    [key: string]: PS;
  }>({});

  useEffect(() => {
    if (settingsData && data) {
      setSettings(
        data.data.reduce((acc, platform) => {
          let setting = settingsData.data.find(
            (item) => item.platform_id === platform.id,
          );

          if (!setting)
            setting = {
              platform_id: platform.id,
              openai_url: '',
              api_key: '',
              prompt: '',
              active: false,
            };

          return {
            ...acc,
            [platform.id]: {
              openai_url: setting.openai_url,
              api_key: setting.api_key,
              prompt: setting.prompt,
              active: setting.active,
            },
          };
        }, {}),
      );
    }
  }, [settingsData, data]);

  const handleInputChange = (id: string, field: string) => (e: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [id]: {
        ...settings[id],
        [field]: e.target.value,
      },
    });
  };

  const handleActiveChange = (id: string) => (e: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [id]: {
        ...settings[id],
        active: e.target.checked,
      },
    });
  };

  const handleSubmit = (platform: Platform) => (e: any) => {
    e.preventDefault();
    if (!settings) return;
    updateMutation.mutate({
      ...settings[platform.id],
      platform_id: platform.id,
    });
  };

  if (isPlatformsLoading || isSettingsDataLoading) {
    return (
      <Stack m={10}>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  return (
    <Box p={5} shadow="md" borderWidth="1px">
      <VStack mb={4} align="flex-start">
        <Heading as="h4" size="md" mb={4}>
          平台设置
        </Heading>
        <Text>独立设置各个平台所使用的 OpenAI 配置</Text>
      </VStack>
      <Accordion allowMultiple>
        {data &&
          settings &&
          data.data
            .filter((item) => item.impl)
            .map((platform) => (
              <AccordionItem key={platform.name}>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      {platform.name}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <form onSubmit={handleSubmit(platform)}>
                    <FormControl display="flex" alignItems="center" mb="3">
                      <FormLabel htmlFor="active" mb="0">
                        启用配置
                      </FormLabel>
                      <Switch
                        id="active"
                        isChecked={settings[platform.id]?.active}
                        onChange={handleActiveChange(platform.id)}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <HStack>
                        <FormLabel>OpenAI 代理地址</FormLabel>
                        <Tooltip label="设置后则不使用全局设置的 OpenAI 地址">
                          <Box color={'gray.500'}>
                            <Icon as={FiHelpCircle} w={6} h={6} />
                          </Box>
                        </Tooltip>
                      </HStack>
                      <Input
                        type="url"
                        value={settings[platform.id]?.openai_url}
                        onChange={handleInputChange(platform.id, 'openai_url')}
                      />
                    </FormControl>
                    <FormControl mt={4} isRequired>
                      <FormLabel>密钥</FormLabel>
                      <Input
                        value={settings[platform.id]?.api_key}
                        onChange={handleInputChange(platform.id, 'api_key')}
                      />
                    </FormControl>
                    <FormControl mt={4}>
                      <HStack>
                        <Text>提示词</Text>
                        <Tooltip label="当前涉及到复杂的知识库需求时，可以使用懒人百宝箱或者 FastGPT 这类拓展知识库工具">
                          <Box color={'gray.500'}>
                            <Icon as={FiHelpCircle} w={6} h={6} />
                          </Box>
                        </Tooltip>
                      </HStack>
                      <Textarea
                        value={settings[platform.id]?.prompt}
                        onChange={handleInputChange(platform.id, 'prompt')}
                      />
                    </FormControl>
                    <Button mt={4} colorScheme="blue" type="submit">
                      更新
                    </Button>
                  </form>
                </AccordionPanel>
              </AccordionItem>
            ))}
      </Accordion>
    </Box>
  );
};

export default React.memo(PlatformSettings);
