/**
 * Common API utilities
 * Shared functions for API simulation
 */

// API delay simulation
export const API_DELAY = {
  MIN: 100,
  MAX: 500,
  ERROR: 1000,
};

// Error rate simulation (0-1)
export const ERROR_RATE = 0.05; // 5% error rate

/**
 * Simulate API delay
 */
export function simulateDelay(isError = false): Promise<void> {
  const delay = isError 
    ? API_DELAY.ERROR 
    : Math.random() * (API_DELAY.MAX - API_DELAY.MIN) + API_DELAY.MIN;
  
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Simulate random errors
 */
export function shouldSimulateError(): boolean {
  return Math.random() < ERROR_RATE;
}

/**
 * Format API response
 */
export function formatResponse<T>(success: boolean, data?: T, error?: string) {
  if (success) {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }
  
  return {
    success: false,
    error: error || 'Unknown error occurred',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handle API error
 */
export async function handleApiCall<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<any> {
  await simulateDelay();
  
  if (shouldSimulateError()) {
    throw new Error(errorMessage);
  }
  
  try {
    const result = await operation();
    return formatResponse(true, result);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : errorMessage);
  }
}