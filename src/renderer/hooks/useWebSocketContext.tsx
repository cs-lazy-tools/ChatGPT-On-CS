import React, {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useMemo,
  useState,
  useCallback,
} from 'react';
import useWebSocket from 'react-use-websocket';

// 定义WebSocket消息类型
interface WebSocketMessage {
  message: string;
  data: any;
  event_id: string;
}

// 定义上下文类型
interface WebSocketContextType {
  acknowledgeMessage: (event: string, eventId: string) => void;
  registerEventHandler: (
    handler: (message: WebSocketMessage) => void,
  ) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { lastMessage, sendMessage } = useWebSocket(
    `ws://127.0.0.1:${window.electron.getPort()}/api/v1/event/ws`,
    {
      shouldReconnect: () => !isConnected, // 仅当未连接时尝试重连
      reconnectInterval: 3000,
      onOpen: () => setIsConnected(true), // 连接成功时设置为已连接
      onClose: () => setIsConnected(false), // 连接关闭时设置为未连接
    },
  );
  const [eventHandlers, setEventHandlers] = useState<
    ((message: WebSocketMessage) => void)[]
  >([]);

  const acknowledgeMessage = useCallback(
    (event: string, eventId: string) => {
      sendMessage(
        JSON.stringify({
          type: 'ack',
          event_type: event,
          event_id: eventId,
        }),
      );
    },
    [sendMessage],
  );

  // 注册事件处理器
  const registerEventHandler = useCallback(
    (handler: (message: WebSocketMessage) => void) => {
      setEventHandlers((prevHandlers) => [...prevHandlers, handler]);
      // 返回注销该处理器的函数
      return () => {
        setEventHandlers((prevHandlers) =>
          prevHandlers.filter((h) => h !== handler),
        );
      };
    },
    [],
  );

  useEffect(() => {
    if (lastMessage !== null) {
      const message: WebSocketMessage = JSON.parse(lastMessage.data);
      eventHandlers.forEach((handler) => handler(message));
    }
  }, [lastMessage, eventHandlers]);

  const value = useMemo(
    () => ({
      acknowledgeMessage,
      registerEventHandler,
    }),
    [acknowledgeMessage, registerEventHandler],
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to use WebSocket context
export const useWebSocketContext = () =>
  useContext(WebSocketContext) as WebSocketContextType;
