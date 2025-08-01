import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize mock system if enabled
import './mocks/initialize'

// Import reset utility for debugging and version check
import './utils/resetMockData'
import { checkAndUpdateDatabaseVersion } from './utils/resetMockData'
import { cleanupDuplicateFactories } from './utils/cleanupDuplicateFactories'

// Check database version on app start
checkAndUpdateDatabaseVersion()

// Clean up duplicate factory IDs on app start
setTimeout(() => {
  cleanupDuplicateFactories().then(count => {
    if (count > 0) {
      console.log(`[App] Cleaned ${count} projects with duplicate factory IDs`);
    }
  });
}, 1000); // Delay to ensure MockDB is initialized

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
