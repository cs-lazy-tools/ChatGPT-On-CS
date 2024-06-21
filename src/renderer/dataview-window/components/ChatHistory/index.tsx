import React, { useState, useMemo, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Tooltip,
  Stack,
  Skeleton,
  InputGroup,
  IconButton,
  InputRightElement,
  useToast,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useTable, useGlobalFilter, useFilters } from 'react-table';
import ReactPaginate from 'react-paginate';
import './index.css';
import { DownloadIcon } from '@chakra-ui/icons';
import {
  Session,
  MessageModel,
} from '../../../common/services/platform/platform';
import {
  getSessions,
  getMessages,
  getPlatformList,
  exportMessageExcel,
} from '../../../common/services/platform/controller';
import { trackPageView } from '../../../common/services/analytics';

const ChatHistory = () => {
  const toast = useToast();
  const { data: platforms, isLoading } = useQuery(
    ['platformList'],
    getPlatformList,
  );
  const [currentPageData, setCurrentPageData] = useState<Session[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [updated, setUpdated] = useState(false);
  const itemsPerPage = 10; // 每一页显示的条数

  useEffect(() => {
    trackPageView('ChatSessionsTable');
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getSessions({
          page: currentPage + 1, // 接口页码从1开始
          pageSize: itemsPerPage,
          keyword: search,
          platformId: filterType,
        });

        console.log('data:', data);
        setPageCount(data.data.count / itemsPerPage);
        setCurrentPageData(data.data.rows);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      }
    };
    fetchSessions();
  }, [currentPage, search, filterType]);

  const handleSessionClick = async (session: Session) => {
    setSelectedSession(session);
    try {
      const data = await getMessages({ sessionId: session.id });
      setMessages(data.data);
      onOpen();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handlePageClick = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  const handleExportMessageExcel = async () => {
    try {
      setUpdated(true);
      await exportMessageExcel();
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

  const columns = useMemo(
    () => [
      { Header: 'ID', accessor: 'id' },
      { Header: '应用', accessor: 'platform_id' },
      { Header: '时间', accessor: 'created_at' },
    ],
    [],
  );

  const tableInstance = useTable(
    // @ts-ignore
    { columns, data: currentPageData },
    useGlobalFilter,
    useFilters,
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const truncateText = (text: any, maxLength: number) => {
    if (typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };

  if (isLoading || !platforms) {
    return (
      <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  return (
    <ChakraProvider>
      <Box p={4} height="85vh" display="flex" flexDirection="column">
        <Box mb={4}>
          <InputGroup>
            <Input
              placeholder="搜索关键词"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              mb={4}
            />
            <InputRightElement>
              <Tooltip label="导出全部消息">
                <IconButton
                  icon={<DownloadIcon />}
                  variant="ghost"
                  colorScheme="brand"
                  aria-label="Export"
                  size="sm"
                  onClick={handleExportMessageExcel}
                  isLoading={updated}
                />
              </Tooltip>
            </InputRightElement>
          </InputGroup>
          <Select
            placeholder="全部平台"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            mb={4}
          >
            {platforms.data.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </Select>
        </Box>
        <Box flex="1" overflow="auto">
          <Table {...getTableProps()}>
            <Thead>
              {headerGroups.map((headerGroup) => (
                <Tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <Th {...column.getHeaderProps()}>
                      {column.render('Header')}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <Tr
                    {...row.getRowProps()}
                    onClick={() => handleSessionClick(row.original)}
                  >
                    {row.cells.map((cell) => (
                      <Td {...cell.getCellProps()}>
                        <Tooltip
                          label={String(cell.value)}
                          aria-label="A tooltip"
                        >
                          {truncateText(String(cell.value), 20)}
                        </Tooltip>
                      </Td>
                    ))}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          mt={4}
          className="pagination-container"
        >
          <ReactPaginate
            previousLabel={'< 上页'}
            nextLabel={'下页 >'}
            breakLabel={'...'}
            pageCount={pageCount}
            marginPagesDisplayed={1}
            pageRangeDisplayed={1}
            onPageChange={handlePageClick}
            containerClassName={'pagination'}
            activeClassName={'active'}
            pageClassName={'page-item'}
            previousClassName={'page-item'}
            nextClassName={'page-item'}
            breakClassName={'page-item'}
            pageLinkClassName={'page-link'}
            previousLinkClassName={'page-link'}
            nextLinkClassName={'page-link'}
            breakLinkClassName={'page-link'}
            activeLinkClassName={'active-link'}
          />
        </Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Messages for Session {selectedSession?.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {messages.map((message) => (
              <Box
                key={message.id}
                mb={4}
                p={4}
                border="1px"
                borderColor="gray.200"
              >
                <Box>角色: {message.role}</Box>
                <Box>内容: {message.content}</Box>
                <Box>发送者: {message.sender}</Box>
                <Box>消息类型: {message.type}</Box>
                <Box>时间: {new Date(message.created_at).toLocaleString()}</Box>
              </Box>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
};

export default ChatHistory;
