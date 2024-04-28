import React, { useEffect } from 'react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Checkbox,
  Stack,
  HStack,
  Tooltip,
} from '@chakra-ui/react';

import { updateRunner } from '../../services/platform/controller';
import { useSystemStore } from '../../stores/useSystemStore';
import { useToast } from '../../hooks/useToast';
import LogBox from './LogBox';

const DriverSettings = () => {
  const { toast } = useToast();
  const { driverSettings, setDriverSettings, selectedPlatforms } =
    useSystemStore();

  useEffect(() => {
    window.electron.ipcRenderer.on('refresh-config', () => {
      const { isPaused, isKeywordMatch } = driverSettings;

      (async () => {
        try {
          await updateRunner({
            ids: selectedPlatforms,
            is_paused: isPaused,
            is_keyword_match: isKeywordMatch,
          });
        } catch (error: any) {
          console.error(error);
        }
      })();
    });

    return () => {
      window.electron.ipcRenderer.remove('refresh-config');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const handleFormChange = (field: string) => (event: any) => {
    const { value, checked, type } = event.target;

    const newDriverSettings = {
      ...driverSettings,
      [field]: type === 'checkbox' ? checked : value,
    };

    setDriverSettings(newDriverSettings);

    if (field === 'isPaused') {
      if (checked) {
        toast({
          position: 'top',
          title: '已经暂停自动回复功能',
          status: 'warning',
        });
      } else {
        toast({
          position: 'top',
          title: '已经开启自动回复功能',
          status: 'success',
        });
      }

      updateRunner({
        is_paused: checked,
        is_keyword_match: driverSettings.isKeywordMatch,
        ids: selectedPlatforms,
      });
    } else if (field === 'isKeywordMatch') {
      updateRunner({
        is_paused: driverSettings.isPaused,
        is_keyword_match: checked,
        ids: selectedPlatforms,
      });
    }
  };

  return (
    <Tabs>
      <TabList>
        <Tab>连接</Tab>
        <Tab>日志</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Stack spacing={4}>
            <HStack width="full" alignItems="center">
              <Checkbox
                mr={4}
                isChecked={driverSettings.isPaused}
                onChange={handleFormChange('isPaused')}
              >
                <Tooltip label="暂停软件后，将不再自动回复消息">
                  暂停软件
                </Tooltip>
              </Checkbox>
              <Checkbox
                isChecked={driverSettings.isKeywordMatch}
                onChange={handleFormChange('isKeywordMatch')}
              >
                <Tooltip label="将优先匹配关键词，未匹配的才去调用 GPT 接口">
                  开启关键词匹配
                </Tooltip>
              </Checkbox>
            </HStack>
          </Stack>
        </TabPanel>
        <TabPanel>
          <Stack spacing={4}>
            <LogBox />
          </Stack>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default DriverSettings;
