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
  const { driverSettings, setDriverSettings } = useSystemStore();

  useEffect(() => {
    window.electron.ipcRenderer.on('refresh-config', () => {
      const { isPaused, isKeywordMatch } = driverSettings;

      (async () => {
        try {
          await updateRunner({
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
  }, [driverSettings, toast]);

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
          title: '已经暂停自动回复功能',
          status: 'warning',
        });
      } else {
        toast({
          title: '已经开启自动回复功能',
          status: 'success',
        });
      }

      updateRunner({
        is_paused: checked,
        is_keyword_match: driverSettings.isKeywordMatch,
      });
    } else if (field === 'isKeywordMatch') {
      updateRunner({
        is_paused: driverSettings.isPaused,
        is_keyword_match: checked,
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
