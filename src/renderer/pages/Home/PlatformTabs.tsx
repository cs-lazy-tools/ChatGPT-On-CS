import React, { useEffect, useState } from 'react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Checkbox,
  Stack,
  Image,
  Box,
  Skeleton,
  CheckboxGroup,
  Grid,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  getPlatformList,
  updatePlatform,
} from '../../services/platform/controller';
import { Platform } from '../../services/platform/platform';
import {
  PlatformTypeMap,
  PlatformTypeEnum,
} from '../../services/platform/constant';
import { useSystemStore } from '../../stores/useSystemStore';
import defaultPlatformIcon from '../../../../assets/base/default-platform-icon.png';
import analytics from '../../services/analytics/index_template';

const PlatformTabs = () => {
  const { data, isLoading } = useQuery(['platformList'], getPlatformList);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const { selectedPlatforms, setSelectedPlatforms } = useSystemStore();

  // 处理数据加载完毕后的平台分组
  const groupedPlatforms = data?.data.reduce(
    (acc, platform) => {
      const type = String(platform.type) || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(platform);
      return acc;
    },
    {} as Record<string, Platform[]>,
  );

  // 第一次加载时需要更新一次后端
  useEffect(() => {
    if (selectedPlatforms && firstLoad) {
      updatePlatform(selectedPlatforms);
      setFirstLoad(false);
    }
  }, [firstLoad, setFirstLoad, selectedPlatforms]);

  const handleCheckboxChange = async (selectedIds: string[]) => {
    const oldSelectedIds = selectedPlatforms;
    setSelectedPlatforms(selectedIds);
    await updatePlatform(selectedIds);

    analytics.onEvent('$ModifySetting', {
      $NewValue: selectedIds,
      $OldValue: oldSelectedIds,
      $Type: 'platforms',
    });
  };

  if (isLoading) {
    return (
      <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  const renderTabPanels = () => {
    const types = Object.keys(groupedPlatforms || {});
    return types.map((type) => (
      <TabPanel key={type}>
        <CheckboxGroup
          colorScheme="green"
          value={selectedPlatforms}
          onChange={handleCheckboxChange}
        >
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            {groupedPlatforms?.[type]?.map((platform) => (
              <Box key={platform.id} display="flex" alignItems="center">
                {/* 显示平台图标，如果没有则显示默认图标 */}
                <Image
                  src={platform.avatar || defaultPlatformIcon}
                  fallbackSrc={defaultPlatformIcon}
                  boxSize="25px"
                  marginRight="12px"
                />
                <Checkbox value={platform.id} isDisabled={!platform.impl}>
                  {platform.name}
                </Checkbox>
              </Box>
            ))}
          </Grid>
        </CheckboxGroup>
      </TabPanel>
    ));
  };

  return (
    <Tabs>
      <TabList>
        {Object.keys(groupedPlatforms || {}).map((type) => (
          <Tab key={type}>{PlatformTypeMap[type as PlatformTypeEnum]}</Tab>
        ))}
      </TabList>

      <TabPanels>{renderTabPanels()}</TabPanels>
    </Tabs>
  );
};

export default PlatformTabs;
