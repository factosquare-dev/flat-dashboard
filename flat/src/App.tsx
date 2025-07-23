import { useEffect } from 'react'
import { AppRouter } from './router'
import { ModalProvider } from './contexts/ModalContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastContainer } from './components/ui/Toast'
import { queryCache } from './hooks/query/queryCache'
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
      <ThemeProvider>
        <ModalProvider>
          <AppRouter />
          <ToastContainer />
        </ModalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
