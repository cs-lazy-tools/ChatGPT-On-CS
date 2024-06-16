import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useCallback,
} from 'react';

// 定义 Broadcast 消息类型
interface BroadcastMessage {
  data: any;
  event: string;
}

// 定义上下文类型
interface BroadcastContextType {
  registerEventHandler: (
    handler: (message: BroadcastMessage) => void,
  ) => () => void;
}

const BroadcastContext = createContext<BroadcastContextType | null>(null);

export const BroadcastProvider = ({ children }: { children: ReactNode }) => {
  const [eventHandlers, setEventHandlers] = useState<
    ((message: BroadcastMessage) => void)[]
  >([]);

  // 注册事件处理器
  const registerEventHandler = useCallback(
    (handler: (message: BroadcastMessage) => void) => {
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

  window.electron.ipcRenderer.on('broadcast', (msg) => {
    const message = msg as BroadcastMessage;
    eventHandlers.forEach((handler) => handler(message));
  });

  const value = useMemo(
    () => ({
      registerEventHandler,
    }),
    [registerEventHandler],
  );

  return (
    <BroadcastContext.Provider value={value}>
      {children}
    </BroadcastContext.Provider>
  );
};

// Hook to use WebSocket context
export const useWebSocketContext = () =>
  useContext(BroadcastContext) as BroadcastContextType;
