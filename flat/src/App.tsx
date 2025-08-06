import { useEffect } from 'react'
import { AppRouter } from './router'
import { ModalProvider } from './components/providers/ModalProvider'
import { RootProviders } from './contexts'
import { ErrorBoundary } from './components/ErrorBoundary/index'
import { queryCache } from './hooks/query/queryCache'
// Load reset utility only in development
if (import.meta.env.DEV) {
  import('./utils/resetMockData');
}
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
        {/* <ThemeInitializer /> */}
        <ModalProvider>
          <AppRouter />
          {/* <ToastContainer /> */}
          {/* <ModalRenderer /> */}
          {/* <LoadingRenderer /> */}
        </ModalProvider>
      </RootProviders>
    </ErrorBoundary>
  )
}

export default App