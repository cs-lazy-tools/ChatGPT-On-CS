import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Skeleton,
  Stack,
  Select,
  HStack,
  Input,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Search2Icon, CloseIcon } from '@chakra-ui/icons';
import {
  getPlatformList,
  getMessageList,
} from '../../services/platform/controller';
import SessionBox from './SessionBox';
import { trackPageView } from '../../services/analytics';
import { Message } from '../../services/platform/platform';

// 假设数据通过 props.sessions 传递
const MsgList = () => {
  useEffect(() => {
    // 页面访问埋点
    trackPageView('Message List');
  }, []);

  const [ptf, setPtf] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1); // 新增分页状态
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 新增状态标识首次加载

  const [sessions, setSessions] = useState<
    {
      sessionId: string;
      messages: Message[];
    }[]
  >([]); // 新增会话状态
  const { data: platforms, isLoading: isPlatformsLoading } = useQuery(
    ['platformList'],
    getPlatformList,
  );

  const {
    data,
    isLoading: isMessagesLoading,
    isFetching,
    refetch,
  } = useQuery(['messageList', page], () =>
    getMessageList({
      page,
      pageSize: 10,
      ptfId: ptf,
      keyword: searchTerm,
      startTime: startDate,
      endTime: endDate,
    }),
  );

  useEffect(() => {
    if (data?.data && !isFetching) {
      const newSessions = Object.entries(data.data).map(
        ([sessionId, messages]) => ({
          sessionId,
          messages,
        }),
      );

      if (isInitialLoad) {
        setSessions(newSessions);
        setIsInitialLoad(false);
      } else {
        setSessions((prevSessions) => [...prevSessions, ...newSessions]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isFetching]); // 添加isFetching依赖

  if (isPlatformsLoading || isMessagesLoading) {
    return (
      <Stack m={10}>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  const handlerSearch = () => {
    setIsInitialLoad(true); // 触发新搜索时，标记为初次加载
    setSessions([]); // 清空现有会话
    setPage(1); // 重置页码
    refetch();
  };

  return (
    <Box>
      <Box m={3}>
        <HStack spacing={4} mt={3} align="stretch">
          <Input
            placeholder="Start Date (YYYY-MM-DD)"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            placeholder="End Date (YYYY-MM-DD)"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </HStack>
        <HStack spacing={4} mt={3} align="stretch">
          <Select
            value={ptf || ''}
            onChange={(e) => setPtf(e.target.value)}
            isDisabled={isPlatformsLoading}
          >
            {platforms?.data.map((platform) => (
              <option value={platform.id}>{platform.name}</option>
            ))}
          </Select>
          <Input
            value={searchTerm}
            placeholder="Search messages"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            colorScheme="orange"
            variant="solid"
            onClick={handlerSearch}
            isLoading={isMessagesLoading || isFetching}
            disabled={isMessagesLoading || isFetching}
          >
            <Search2Icon />
          </Button>

          {(ptf || searchTerm || startDate || endDate) && (
            <Button
              onClick={() => {
                setPtf('');
                setStartDate('');
                setEndDate('');
                setSearchTerm('');
              }}
            >
              <CloseIcon />
            </Button>
          )}
        </HStack>
      </Box>

      <VStack spacing={4} mt={5} align="stretch">
        {sessions.map((session, index) => (
          <SessionBox
            index={index}
            sessionId={session.sessionId}
            messages={session.messages}
          />
        ))}
      </VStack>

      {data?.data && data.total > 0 && (
        <VStack spacing={4} mt={5} align="stretch">
          <Button
            mx={3}
            isLoading={isFetching}
            colorScheme="orange"
            variant="solid"
            onClick={() => setPage((prevPage) => prevPage + 1)}
          >
            加载更多
          </Button>
        </VStack>
      )}
    </Box>
  );
};

export default React.memo(MsgList);
