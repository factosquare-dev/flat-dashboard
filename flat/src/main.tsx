import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize mock system if enabled
import './mocks/initialize'

// Import reset utility for debugging and version check
import './utils/resetMockData'
import { checkAndUpdateDatabaseVersion } from './utils/resetMockData'

// Check database version on app start
checkAndUpdateDatabaseVersion()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
