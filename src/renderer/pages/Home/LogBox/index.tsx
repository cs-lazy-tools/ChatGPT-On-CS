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
  Button,
  Box,
  VStack,
} from '@chakra-ui/react';
import { useWebSocketContext } from '../../../hooks/useBroadcastContext';
import useGlobalStore from '../../../stores/useGlobalStore';

const LogBox = () => {
  const { logs, clearLogs, addLog } = useGlobalStore();
  const { registerEventHandler } = useWebSocketContext();

  useEffect(() => {
    const unregister = registerEventHandler((message) => {
      if (message.event === 'log_show') {
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
  }, [registerEventHandler]); // eslint-disable-line

  const clearLog = () => {
    clearLogs();
  };

  const openSelectedFolder = () => {
    window.electron.ipcRenderer.sendMessage('open-logger-folder');
  };

  return (
    <Box>
      <VStack>
        {/* 靠左对齐 */}
        <HStack width="full" justifyContent="flex-start">
          <Button size="sm" onClick={clearLog}>
            清空全部日志
          </Button>
          <Button size="sm" onClick={openSelectedFolder}>
            打开日志文件
          </Button>
        </HStack>

        <TableContainer maxH={'150px'} overflowY="scroll" width="full">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>时间</Th>
                <Th>内容</Th>
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
      </VStack>
    </Box>
  );
};

export default React.memo(LogBox);
