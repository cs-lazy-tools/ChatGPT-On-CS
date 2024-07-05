import React from 'react';
import {
  Box,
  Text,
  Stack,
  useColorModeValue,
  Tooltip,
  Link,
} from '@chakra-ui/react';

const Footer = () => {
  const bg = useColorModeValue('gray.100', 'gray.900');

  return (
    <Box
      as="footer"
      role="contentinfo"
      maxW="7xl"
      py="3"
      px={{ base: '4', md: '8' }}
      bg={bg}
    >
      <Stack>
        <Box position={'absolute'}>
          <Tooltip label="查看文档获取帮助">
            <Link href="https://doc.lazaytools.top/docs" isExternal mr="auto">
              📚文档
            </Link>
          </Tooltip>
        </Box>

        <Text fontSize="sm" alignSelf={{ base: 'center' }}>
          &copy; {new Date().getFullYear()} lrhh123. All rights reserved.
        </Text>
      </Stack>
    </Box>
  );
};

export default Footer;
