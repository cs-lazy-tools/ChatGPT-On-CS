import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from 'react';
import {
  CustomerServiceSettingsForm,
  GptSettingsForm,
} from '../../services/platform/platform';

// 定义Context的类型
interface SettingsContextType {
  customerServiceSettings: CustomerServiceSettingsForm;
  setCustomerServiceSettings: (settings: CustomerServiceSettingsForm) => void;
  gptSettings: GptSettingsForm;
  setGptSettings: (settings: GptSettingsForm) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [customerServiceSettings, setCustomerServiceSettings] =
    useState<CustomerServiceSettingsForm>({
      extractPhone: false,
      extractProduct: false,
      folderPath: '',
      replySpeed: 0,
      mergeUnprocessedMessagesCount: 0,
      manualInterventionInterval: 0,
    });

  const [gptSettings, setGptSettings] = useState<GptSettingsForm>({
    useLazyTools: false,
    gptAddress: '',
    apiKey: '',
    lazyKey: '',
    model: '',
    temperature: 0,
    topP: 0,
    stream: false,
  });

  // 使用useMemo来记忆Provider的value
  const value = useMemo(
    () => ({
      customerServiceSettings,
      setCustomerServiceSettings,
      gptSettings,
      setGptSettings,
    }),
    [customerServiceSettings, gptSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook用于子组件访问Context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
