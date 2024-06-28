import React from 'react';
import { Text, HStack, Switch, Tooltip, Flex } from '@chakra-ui/react';

type GlobalSwitchProps = {
  isGlobal: boolean;
  setIsGlobal: (isGlobal: boolean) => void;
};

const GlobalSwitch = ({ isGlobal, setIsGlobal }: GlobalSwitchProps) => (
  <Flex mt={3} alignItems="center">
    <Tooltip label="该关键词是否面向全部平台，否则请选择一个适用的平台">
      <HStack spacing={4} width="100%">
        <Text fontSize="large">开启全局关键词</Text>
        <Switch
          isChecked={isGlobal}
          onChange={() => setIsGlobal(!isGlobal)}
          size="lg"
        />
      </HStack>
    </Tooltip>
  </Flex>
);

export default GlobalSwitch;
