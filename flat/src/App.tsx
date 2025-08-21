import { useEffect } from 'react'
import { AppRouter } from './app/router'
import { ModalProvider } from './components/providers/ModalProvider'
import { RootProviders } from './app/providers'
import { ErrorBoundary } from './shared/components/ErrorBoundary'
import { queryCache } from './shared/hooks/query/queryCache'
// Load reset utility only in development
if (import.meta.env.DEV) {
  import('./shared/utils/resetMockData');
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