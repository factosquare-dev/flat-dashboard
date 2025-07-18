import { AppRouter } from './router'
import { ModalProvider } from './contexts/ModalContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastContainer } from './components/ui/Toast'
import './App.css'

function App() {
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
