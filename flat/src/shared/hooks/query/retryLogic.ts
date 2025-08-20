export interface RetryConfig {
  retry: boolean | number;
  retryDelay: number;
  onError?: (error: Error) => void;
}

export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  attemptCount: number = 0
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const { retry, retryDelay, onError } = config;
    
    // Determine if we should retry
    const maxRetries = typeof retry === 'number' ? retry : (retry ? 3 : 0);
    const shouldRetry = attemptCount < maxRetries;
    
    if (shouldRetry) {
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attemptCount + 1)));
      return executeWithRetry(fn, config, attemptCount + 1);
    }
    
    // Call error callback if provided
    if (onError && error instanceof Error) {
      onError(error);
    }
    
    throw error;
  }
}