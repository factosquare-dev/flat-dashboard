/**
 * Reset mock data utility
 * This function clears localStorage and resets the mock database
 */

export const resetMockData = () => {
  try {
    // Clear localStorage
    const keysToRemove = [
      'flat_mock_db',
      'flat_users',
      'flat_projects',
      'flat_schedules',
      'flat_factories',
      'flat_customers'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ LocalStorage cleared successfully');
    
    // Force page reload to reinitialize mock database
    window.location.reload();
  } catch (error) {
    console.error('❌ Failed to reset mock data:', error);
  }
};

// Export for console usage
(window as any).resetMockData = resetMockData;