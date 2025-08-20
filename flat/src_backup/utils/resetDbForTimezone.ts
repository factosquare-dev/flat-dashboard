/**
 * Reset database to apply timezone fixes
 */

export function resetDatabaseForTimezone() {
  try {
    // Clear the existing database
    localStorage.removeItem('flat_mock_db');
    localStorage.removeItem('flat_mock_db_version');
    
    // Force reload to reinitialize with new date logic
    window.location.reload();
    
    console.log('Database reset for timezone fix. Page will reload...');
  } catch (error) {
    console.error('Failed to reset database:', error);
  }
}

// Make it available in console
(window as any).resetDatabaseForTimezone = resetDatabaseForTimezone;