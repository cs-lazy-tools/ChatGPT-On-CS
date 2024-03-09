import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

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

type State = {
  selectedPlatforms: string[];
  setSelectedPlatforms: (ids: string[]) => void;
  driverSettings: {
    isPaused: boolean;
    isKeywordMatch: boolean;
  };
  setDriverSettings: (settings: {
    isPaused: boolean;
    isKeywordMatch: boolean;
  }) => void;
};

export const useSystemStore = create<State>()(
  devtools(
    persist(
      immer((set) => ({
        selectedPlatforms: [],
        setSelectedPlatforms: (ids: string[]) => {
          set((state) => {
            state.selectedPlatforms = ids;
          });
        },
        driverSettings: {
          isPaused: true,
          runMode: 'AUTO_SWITCH',
          isKeywordMatch: true,
        },
        setDriverSettings: (settings) => {
          set((state) => {
            state.driverSettings = settings;
          });
        },
      })),
      {
        name: 'globalStore',
        storage: createJSONStorage(() => electronStore),
        partialize: (state) => ({
          selectedPlatforms: state.selectedPlatforms,
          driverSettings: state.driverSettings,
        }),
      },
    ),
  ),
);
