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
  Tooltip,
  Stack,
  Skeleton,
  InputGroup,
  IconButton,
  InputRightElement,
  useToast,
  Flex,
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
import MessageModal from '../MessageModal';

const SessionHistory = () => {
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
  const itemsPerPage = 12; // 每一页显示的条数

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
      { Header: '应用名称', accessor: 'platform' },
      { Header: '记录时间', accessor: 'created_at' },
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
        <Flex mb={4} alignItems="center">
          <InputGroup mr={4}>
            <Input
              placeholder="搜索关键词"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <Select
            placeholder="全部平台"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            mr={4}
          >
            {platforms.data.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </Select>
          <Tooltip label="导出全部消息">
            <IconButton
              icon={<DownloadIcon />}
              variant="solid"
              colorScheme="blue"
              aria-label="Export"
              onClick={handleExportMessageExcel}
              isLoading={updated}
            />
          </Tooltip>
        </Flex>
        <Box flex="1" overflow="auto">
          <Table
            {...getTableProps()}
            variant="striped"
            colorScheme="gray"
            size="sm"
          >
            <Thead>
              {headerGroups.map((headerGroup, ii) => (
                <Tr {...headerGroup.getHeaderGroupProps()} key={ii}>
                  {headerGroup.headers.map((column, i) => (
                    <Th {...column.getHeaderProps()} key={i}>
                      {column.render('Header')}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody {...getTableBodyProps()}>
              {rows.map((row, ii) => {
                prepareRow(row);
                return (
                  <Tr
                    {...row.getRowProps()}
                    key={ii}
                    onClick={() => handleSessionClick(row.original)}
                    cursor="pointer"
                    _hover={{ bg: 'gray.100' }}
                  >
                    {row.cells.map((cell, i) => (
                      <Td {...cell.getCellProps()} key={i}>
                        <Tooltip
                          label={String(cell.value)}
                          aria-label="A tooltip"
                        >
                          {truncateText(String(cell.value), 25)}
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

      <MessageModal isOpen={isOpen} onClose={onClose} messages={messages} />
    </ChakraProvider>
  );
};

export default SessionHistory;
