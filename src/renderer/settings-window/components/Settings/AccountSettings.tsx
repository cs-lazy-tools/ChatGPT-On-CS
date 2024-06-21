import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Text,
  VStack,
  Container,
  Input,
  Button,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

const AccountSettings = () => {
  const [activationCode, setActivationCode] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [expiryDate, setExpiryDate] = useState('2024-12-31'); // 你可以根据需要动态设置
  const [activationStatus, setActivationStatus] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const currentDate = new Date();
    const expiry = new Date(expiryDate);
    if (currentDate > expiry) {
      setIsExpired(true);
    }
  }, [expiryDate]);

  const handleActivation = () => {
    // 在这里添加激活逻辑
    if (activationCode && !isExpired) {
      setActivationStatus('激活失败');
    } else if (isExpired) {
      setActivationStatus('激活码已过期');
    } else {
      setActivationStatus('请输入有效的激活码');
    }
  };

  return (
    <ChakraProvider>
      <Container>
        <VStack spacing="4" align="start" mt="8">
          <Text>输入激活码</Text>
          <Input
            placeholder="激活码"
            value={activationCode}
            onChange={(e) => setActivationCode(e.target.value)}
            isDisabled={isExpired}
          />
          {/* <Text>激活码到期时间: {expiryDate}</Text> */}
          <Button
            colorScheme="blue"
            onClick={handleActivation}
            isDisabled={isExpired}
          >
            激活
          </Button>
          {activationStatus && (
            <Alert
              status={activationStatus === '激活成功' ? 'success' : 'error'}
            >
              <AlertIcon />
              {activationStatus}
            </Alert>
          )}
          {isExpired && (
            <Alert status="error">
              <AlertIcon />
              激活码已过期，请联系支持获取新的激活码。
            </Alert>
          )}
        </VStack>
      </Container>
    </ChakraProvider>
  );
};

export default AccountSettings;
