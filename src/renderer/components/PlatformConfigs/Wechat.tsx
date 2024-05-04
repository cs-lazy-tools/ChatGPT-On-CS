import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Switch,
  AbsoluteCenter,
  Divider,
} from '@chakra-ui/react';
import { isEqual } from 'lodash';
import BaseSettings, { DataType } from './Base';

// 扩展 DataType 来包含特定于微信的数据
type WechatDataType = DataType & {
  addFriends: boolean;
};

type WechatSettingsProps = {
  onChange?: (settings: DataType) => void;
  baseData?: WechatDataType;
};

const WechatSettings = ({ onChange, baseData }: WechatSettingsProps) => {
  const [localData, setLocalData] = useState<WechatDataType>({
    active: false,
    useDify: false,
    proxyAddress: '',
    apiKey: '',
    defaultReply: '',
    contextCount: 1,
    addFriends: false,
  });

  useEffect(() => {
    if (baseData && !isEqual(localData, baseData)) {
      setLocalData({
        ...baseData,
        addFriends: baseData?.addFriends || false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseData]);

  // 更新状态并通知外部变更
  const updateData = (data: Partial<WechatDataType>) => {
    const newData = { ...localData, ...data };
    setLocalData(newData);
    if (onChange && !isEqual(localData, newData)) {
      onChange(newData);
    }
  };

  return (
    <>
      <BaseSettings baseData={localData} onChange={updateData} />
      <Box position="relative" padding="10">
        <Divider />
        <AbsoluteCenter bg="white" px="4">
          微信专属设置
        </AbsoluteCenter>
      </Box>
      <FormControl display="flex" alignItems="center" mb="3">
        <FormLabel htmlFor="add-friends" mb="0">
          自动加好友
        </FormLabel>
        <Switch
          id="add-friends"
          isChecked={localData.addFriends}
          onChange={() => updateData({ addFriends: !localData.addFriends })}
        />
      </FormControl>
    </>
  );
};

export default WechatSettings;
