import { createRoot } from 'react-dom/client';
import React, { useEffect, useState } from 'react';

const App = () => {
  const [args, setArgs] = useState<string[]>([]);
  const [settings, setSettings] = useState<{
    appId?: string;
    instanceId?: string;
  }>({});

  useEffect(() => {
    const { electron } = window;
    console.log('getEnv', electron.getEnv('NODE_ENV'));
    if (electron) {
      const receivedArgs = electron.getArgs();
      setArgs(receivedArgs);
      const settingsArgs = receivedArgs.reduce(
        (acc: { appId?: string; instanceId?: string }, arg: string) => {
          if (arg.startsWith('settings-app-id-')) {
            acc.appId = arg.replace('settings-app-id-', '');
          }
          if (arg.startsWith('settings-instance-id-')) {
            acc.instanceId = arg.replace('settings-instance-id-', '');
          }
          return acc;
        },
        {},
      );
      setSettings(settingsArgs);
    }
  }, []);

  return (
    <div>
      <h1>Electron React Boilerplate</h1>
      <p>Arguments: {args.join(', ')}</p>
      <div>
        <h2>Settings</h2>
        <p>App ID: {settings.appId}</p>
        <p>Instance ID: {settings.instanceId}</p>
      </div>
    </div>
  );
};

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
