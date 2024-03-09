import React, { useEffect } from 'react';
import { Box, Button, Stack, useToast, Skeleton } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import GptSettings from './GptSettings';
import CustomerServiceSettings from './CustomerServiceSettings';
import { getConfig, updateConfig } from '../../services/platform/controller';
import { useSettings } from './SettingsContext';
import analytics from '../../services/analytics/index_template';

const SettingsPage = () => {
  useEffect(() => {
    // 页面访问埋点
    analytics.onEvent('$PageView', {
      $PageName: 'settings',
    });
  }, []);

  const {
    customerServiceSettings,
    setCustomerServiceSettings,
    gptSettings,
    setGptSettings,
  } = useSettings();
  const toast = useToast();
  const { data, isLoading } = useQuery(['config'], getConfig);

  useEffect(() => {
    if (data && !isLoading) {
      setGptSettings({
        useLazyTools: data.data.use_lazy || false,
        gptAddress: data.data.gpt_base_url || '',
        model: data.data.gpt_model || '',
        temperature: data.data.gpt_temperature || 0.7,
        apiKey: data.data.gpt_key || '',
        topP: data.data.gpt_top_p || 0.75,
        stream: data.data.stream || false,
        lazyKey: data.data.lazy_key || '',
      });
      setCustomerServiceSettings({
        extractPhone: data.data.extract_phone || false,
        extractProduct: data.data.extract_product || false,
        folderPath: data.data.save_path || '',
        replySpeed: data.data.reply_speed || 0,
        mergeUnprocessedMessagesCount: data.data.merged_message_num || 7,
        manualInterventionInterval: data.data.wait_humans_time || 60,
      });
    }
  }, [isLoading, data, setGptSettings, setCustomerServiceSettings]);

  const handleSaveSettings = async () => {
    try {
      await updateConfig({
        extract_phone: customerServiceSettings.extractPhone,
        extract_product: customerServiceSettings.extractProduct,
        save_path: customerServiceSettings.folderPath,
        reply_speed: customerServiceSettings.replySpeed,
        merged_message_num:
          customerServiceSettings.mergeUnprocessedMessagesCount,
        wait_humans_time: customerServiceSettings.manualInterventionInterval,
        gpt_base_url: gptSettings.gptAddress,
        gpt_key: gptSettings.apiKey,
        gpt_model: gptSettings.model,
        gpt_temperature: gptSettings.temperature,
        gpt_top_p: gptSettings.topP,
        stream: gptSettings.stream,
        use_lazy: gptSettings.useLazyTools,
        lazy_key: gptSettings.lazyKey,
      });
      toast({
        title: '保存成功',
        status: 'success',
      });
    } catch (error: any) {
      toast({
        title: '保存失败',
        description: error.message,
        status: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <Stack m={10}>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  return (
    <Box p={4}>
      <Stack spacing={4}>
        <CustomerServiceSettings />
        <GptSettings />
        <Button colorScheme="blue" onClick={handleSaveSettings}>
          保存设置
        </Button>
      </Stack>
    </Box>
  );
};

export default SettingsPage;
