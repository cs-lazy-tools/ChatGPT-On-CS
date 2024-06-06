import React from 'react';
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Badge,
  Text,
  VStack,
  IconButton,
  Spacer,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

const AppManagerComponent = () => {
  const high = '42vh'; // 调整为合适的全局高度

  return (
    <Flex h={high}>
      <Box w="40%" bg="brand.50" display="flex" flexDirection="column">
        <Box p={4} position="sticky" top="0" zIndex="1">
          <Flex align="center">
            <InputGroup>
              <Input placeholder="搜索" />
              <InputRightElement>
                <IconButton
                  icon={<SearchIcon />}
                  variant="ghost"
                  colorScheme="brand"
                  aria-label="Search"
                  size="sm"
                />
              </InputRightElement>
            </InputGroup>
          </Flex>
        </Box>
        <VStack spacing={3} align="stretch" overflowY="auto" flex="1" p={4}>
          {[...Array(20)].map((_, i) => (
            <Flex key={i} bg="red.100" borderRadius="md" p={3} align="center">
              <Box w="100%" h="50px" bg="gray.200" borderRadius="md" />
              <Spacer />
              {i === 1 && (
                <Badge ml="1" colorScheme="red">
                  2
                </Badge>
              )}
              {i === 2 && (
                <Badge ml="1" colorScheme="red">
                  5
                </Badge>
              )}
            </Flex>
          ))}
        </VStack>
      </Box>
      <Box w="60%" p={4} bg="gray.50" overflowY="auto">
        <VStack spacing={4}>
          {[...Array(20)].map((_, i) => (
            <Box key={i} w="100%" h="100px" bg="gray.200" borderRadius="md" />
          ))}
          <Box
            w="100%"
            h="100px"
            bg="gray.300"
            borderRadius="md"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Text fontSize="3xl" color="gray.500">
              +
            </Text>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};

export default React.memo(AppManagerComponent);
