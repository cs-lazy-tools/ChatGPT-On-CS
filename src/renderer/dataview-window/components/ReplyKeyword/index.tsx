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
  useToast,
  Text,
  Button,
  IconButton,
  Box,
  Skeleton,
  Stack,
  Tooltip,
  HStack,
  Grid,
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon, EditIcon } from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';
import EditKeyword from '../EditKeyword';
import {
  getReplyList,
  deleteReplyKeyword,
  updateReplyExcel,
  exportReplyExcel,
} from '../../../common/services/platform/controller';
import { Keyword } from '../../../common/services/platform/platform';

const ReplyKeyword = () => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [editKeyword, setEditKeyword] = useState<Keyword | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [updated, setUpdated] = useState(false);

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

  const handleInsertFile = () => {
    window.electron.ipcRenderer.sendMessage('select-file', {
      filters: [{ name: 'Excel 模板', extensions: ['xls', 'xlsx'] }],
    });
    window.electron.ipcRenderer.once('selected-file', async (path) => {
      const selectedPath = path as string[];
      if (!selectedPath.length || !selectedPath[0]) return;
      console.log(selectedPath);
      setUpdated(true);
      try {
        await updateReplyExcel({ path: selectedPath[0] });
        refetch();
        toast({
          title: '导入成功',
          description: '导入成功',
          position: 'top',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (e) {
        let message = '导入失败';
        if (e instanceof Error) {
          message = e.message;
        } else if (typeof e === 'string') {
          message = e;
        } else {
          message = JSON.stringify(e);
        }

        toast({
          title: '导入失败',
          description: message,
          position: 'top',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setUpdated(false);
      }
    });
  };

  const handleExportReplyExcel = async () => {
    try {
      setUpdated(true);
      await exportReplyExcel();
      toast({
        title: '导出成功',
        description: '导出成功',
        position: 'top',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (e) {
      let message = '导出失败';
      if (e instanceof Error) {
        message = e.message;
      } else if (typeof e === 'string') {
        message = e;
      } else {
        message = JSON.stringify(e);
      }

      toast({
        title: '导出失败',
        description: message,
        position: 'top',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdated(false);
    }
  };

  const handleDoubleClick = (keyword: Keyword) => {
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
    const newKeyword: Keyword = {
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
          <HStack>
            <Button
              size="sm"
              leftIcon={<AddIcon />}
              color="white"
              bgGradient="linear(to-r, teal.500, green.500)"
              _hover={{
                bgGradient: 'linear(to-r, teal.300, green.300)',
              }}
              variant="solid"
              onClick={handleAddKeyword}
              isLoading={updated}
            >
              新增关键词
            </Button>
            <Tooltip label="导入并覆盖关键词">
              <Button
                size="sm"
                variant="solid"
                colorScheme="linkedin"
                onClick={handleInsertFile}
                isLoading={updated}
              >
                覆盖导入
              </Button>
            </Tooltip>
            <Tooltip label="导出关键词（下载模板）">
              <Button
                size="sm"
                variant="solid"
                onClick={handleExportReplyExcel}
                isLoading={updated}
              >
                导出
              </Button>
            </Tooltip>
          </HStack>
        </Flex>
      </Box>
      <TableContainer maxH={'70vh'} overflowY="scroll">
        <Table variant="striped" size="sm" className="table-tiny">
          <Thead>
            <Tr>
              <Th>平台</Th>
              <Th>关键词</Th>
              <Th>回复内容</Th>
              <Th>模糊匹配</Th>
              <Th>正则</Th>
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
                <Td>{keyword.app_name}</Td>
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
                <Td>{keyword.fuzzy ? '是' : '否'}</Td>
                <Td>{keyword.has_regular ? '是' : '否'}</Td>
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
