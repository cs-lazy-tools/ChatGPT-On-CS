import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box, Flex } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/Home';
import SettingsPage from './pages/Settings';
import AboutPage from './pages/About';
import MsgList from './pages/MsgList';
import FullScreenLoader from './pages/FullScreenLoader';
import PlatformSettings from './pages/Platforms';
import { SettingsProvider } from './pages/Settings/SettingsContext';
import Updater from './components/Updater';
import SystemCheck from './components/SystemCheck';
import { WebSocketProvider } from './hooks/useWebSocketContext';
import './App.css';
import theme from './ui/styles/theme';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      retry: false,
      cacheTime: 10,
    },
  },
});

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    window.electron.ipcRenderer.on('check-health', (health) => {
      const h = health as boolean;
      setIsLoaded(h);
    });

    return () => {
      window.electron.ipcRenderer.remove('check-health');
    };
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <WebSocketProvider>
          <ErrorBoundary>
            <Router>
              {isLoaded ? (
                <Flex direction="column" minH="100vh">
                  <Navbar />
                  <Box flex="1" mt={{ base: '4rem', md: '5rem' }}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/msg" element={<MsgList />} />
                      <Route path="/platforms" element={<PlatformSettings />} />
                      <Route
                        path="/settings"
                        element={
                          <SettingsProvider>
                            <SettingsPage />
                          </SettingsProvider>
                        }
                      />
                      <Route path="/about" element={<AboutPage />} />
                    </Routes>
                  </Box>
                  <Footer />
                </Flex>
              ) : (
                <FullScreenLoader />
              )}
              <SystemCheck />
              <Updater />
            </Router>
          </ErrorBoundary>
        </WebSocketProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
