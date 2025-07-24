import { useEffect } from 'react'
import { AppRouter } from './router'
import { ModalProvider } from './contexts/ModalContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { RootProviders } from './contexts'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastContainer } from './components/ui/Toast'
import { queryCache } from './hooks/query/queryCache'
import './utils/resetMockData' // Load reset utility for development
import './App.css'

function App() {
  useEffect(() => {
    // Cleanup queryCache on app unmount
    return () => {
      queryCache.destroy();
    };
  }, []);

  return (
    <ErrorBoundary>
      <RootProviders>
        <ThemeProvider>
          <ModalProvider>
            <AppRouter />
            <ToastContainer />
          </ModalProvider>
        </ThemeProvider>
      </RootProviders>
    </ErrorBoundary>
  )
}

export default App
