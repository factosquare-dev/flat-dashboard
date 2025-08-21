import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize mock system if enabled
import './mocks/initialize'

// Import reset utility for debugging and version check
import './shared/utils/resetMockData'
import { checkAndUpdateDatabaseVersion } from './shared/utils/resetMockData'
import { cleanupDuplicateFactories } from './shared/utils/cleanupDuplicateFactories'
import { cleanupInvalidEntries } from './shared/utils/cleanupDatabase'

// Check database version on app start
checkAndUpdateDatabaseVersion()

// Clean up database on app start
setTimeout(() => {
  // First clean up invalid entries
  const invalidCount = cleanupInvalidEntries();
  // Cleaned invalid database entries if needed
  
  // Then clean up duplicate factory IDs
  cleanupDuplicateFactories().then(() => {
    // Cleaned duplicate factory IDs if needed
  });
}, 1000); // Delay to ensure MockDB is initialized

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
