import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Message } from '../../common/services/platform/platform';

const electronStore = {
  getItem: (key: string) => {
    const value = window.electron.store.get(key);
    try {
      return JSON.parse(value); // 确保字符串被正确解析为对象
    } catch (error) {
      return null; // 解析失败时返回null或合理的默认值
    }
  },
  setItem: (key: string, value: any) => {
    window.electron.store.set(key, JSON.stringify(value));
  },
  removeItem: (key: string) => {
    window.electron.store.remove(key);
  },
};

// Define message and driver state types
type MessageState = {
  context: Record<string, string>;
  messages: Message[];
  setContext: (key: string, value: string) => void;
  clearContext: () => void;
  addMessage: (message: Message) => void;
  removeMessage: (index: number) => void;
};

type State = MessageState;

// Create Zustand store
export const useSystemStore = create<State>()(
  devtools(
    persist(
      immer((set) => ({
        context: {},
        setContext: (key, value) =>
          set((state) => {
            state.context[key] = value;
          }),
        clearContext: () =>
          set((state) => {
            state.context = {};
          }),
        messages: [],
        addMessage: (message) =>
          set((state) => {
            state.messages.push(message);
          }),
        removeMessage: (index) =>
          set((state) => {
            state.messages.splice(index, 1);
          }),
      })),
      {
        name: 'globalStore',
        storage: createJSONStorage(() => electronStore),
        partialize: (state) => ({
          context: state.context,
          messages: state.messages,
        }),
      },
    ),
  ),
);
