import React, { useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  TableContainer,
  Text,
  Button,
  Box,
} from '@chakra-ui/react';
import { useWebSocketContext } from '../../hooks/useWebSocketContext';
import useGlobalStore from '../../stores/useGlobalStore';

const LogBox = () => {
  const { logs, clearLogs, addLog } = useGlobalStore();
  const { registerEventHandler, acknowledgeMessage } = useWebSocketContext();

  useEffect(() => {
    const unregister = registerEventHandler((message) => {
      if (message.message === 'log_show') {
        acknowledgeMessage('log_show', message.event_id);
        if (message.data) {
          const log = message.data as {
            time: string;
            content: string;
          };

          if (log) {
            addLog(log);
          }
        }
      }
    });

    // 组件卸载时注销事件处理器
    return () => unregister();
  }, [registerEventHandler, acknowledgeMessage]); // eslint-disable-line

  const clearLog = () => {
    clearLogs();
  };

  return (
    <Box>
      <TableContainer maxH={'150px'} overflowY="scroll">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>时间</Th>
              <Th>
                <HStack width="full">
                  <Text>内容</Text>
                  <Button size="sm" onClick={clearLog}>
                    清空全部日志
                  </Button>
                </HStack>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {logs.map((log, index) => (
              <Tr key={index}>
                <Td>{log.time}</Td>
                <Td>{log.content}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default React.memo(LogBox);
