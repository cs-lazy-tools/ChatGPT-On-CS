import React from 'react';
import { Center, Text } from '@chakra-ui/react';
import Loader from '../../components/Loader';

const FullScreenLoader = () => {
  return (
    <Center h="100vh" w="100vw" bg="white" flexDirection="column">
      <Text fontSize="lg" mt="4" zIndex={10} pb={40}>
        正在启动本地服务，请稍候...
      </Text>
      <Text fontSize="sm" zIndex={10}>
        (注意：安装后的第一次启动需要下载驱动，请耐心等待)
      </Text>
      <Loader />
    </Center>
  );
};

export default React.memo(FullScreenLoader);
