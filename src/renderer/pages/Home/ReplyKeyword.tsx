import React, { useState, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  TableContainer,
  useDisclosure,
  Text,
  Button,
  IconButton,
  Box,
  Skeleton,
  Stack,
  Tooltip,
  Grid,
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon, EditIcon } from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';
import EditKeyword from './EditKeyword';
import {
  getReplyList,
  deleteReplyKeyword,
} from '../../services/platform/controller';
import { Reply } from '../../services/platform/platform';

const ReplyKeyword = () => {
  const [keywords, setKeywords] = useState<Reply[]>([]);
  const [editKeyword, setEditKeyword] = useState<Reply | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, isLoading, refetch } = useQuery(
    ['replyList'],
    () => {
      return getReplyList({
        page: 1,
        pageSize: 100,
        ptfId: '',
      });
    },
    {
      retry: () => {
        return true;
      },
      retryDelay: () => {
        return 1000;
      },
    },
  );

  useEffect(() => {
    if (data) {
      setKeywords(data?.data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  const handleDoubleClick = (keyword: Reply) => {
    setEditKeyword(keyword);
    onOpen();
  };

  const handleEdit = () => {
    refetch();
    onClose();
  };

  const handleDelete = async (id: number) => {
    await deleteReplyKeyword(id);
    refetch();
  };

  const handleAddKeyword = () => {
    const newKeyword: Reply = {
      keyword: '',
      reply: '',
      mode: 'fuzzy',
    };
    setKeywords([...keywords, newKeyword]);
    setEditKeyword(newKeyword);
    onOpen();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Text>编辑回复关键词</Text>
        <Flex alignItems="center">
          {' '}
          <Button
            leftIcon={<AddIcon />}
            color="white"
            bgGradient="linear(to-r, teal.500, green.500)"
            _hover={{
              bgGradient: 'linear(to-r, teal.300, green.300)',
            }}
            variant="solid"
            onClick={handleAddKeyword}
          >
            新增关键词
          </Button>
          {/* 在图标旁边添加文案，并设置左边距 */}
        </Flex>
      </Box>
      <TableContainer maxH={'300px'} overflowY="scroll">
        <Table variant="striped" size="sm" className="table-tiny">
          <Thead>
            <Tr>
              <Th>平台</Th>
              <Th>关键词</Th>
              <Th>回复内容</Th>
              <Th>操作</Th>
            </Tr>
          </Thead>
          <Tbody>
            {keywords.map((keyword) => (
              <Tr
                sx={{ height: '30px' }}
                key={keyword.id}
                onDoubleClick={() => handleDoubleClick(keyword)}
              >
                <Td>{keyword.ptf_name}</Td>
                <Td
                  maxW="80px"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {keyword.keyword}
                </Td>
                <Td
                  maxW="150px"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {keyword.reply}
                </Td>
                <Td>
                  <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                    <Tooltip label="删除">
                      <IconButton
                        size="xs" // 设置为最小尺寸
                        fontSize="13px"
                        colorScheme="red"
                        aria-label="Delete keyword"
                        icon={<DeleteIcon />}
                        onClick={() => keyword.id && handleDelete(keyword.id)}
                      />
                    </Tooltip>

                    <Tooltip label="编辑">
                      <IconButton
                        size="xs" // 设置为最小尺寸
                        fontSize="13px"
                        colorScheme="blue"
                        aria-label="Edit keyword"
                        icon={<EditIcon />}
                        onClick={() => {
                          setEditKeyword(keyword);
                          onOpen();
                        }}
                      />
                    </Tooltip>
                  </Grid>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <EditKeyword
        isOpen={isOpen}
        onClose={onClose}
        editKeyword={editKeyword}
        handleEdit={handleEdit}
      />
    </Box>
  );
};

export default ReplyKeyword;
