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
  if (invalidCount > 0) {
    console.log(`[App] Cleaned ${invalidCount} invalid database entries`);
  }
  
  // Then clean up duplicate factory IDs
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
