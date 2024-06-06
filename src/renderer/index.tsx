import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactGA from 'react-ga4';
import App from './App';
import { trackingID } from './services/analytics';

ReactGA.initialize(trackingID);
const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
