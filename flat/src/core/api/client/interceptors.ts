import axios, { AxiosInstance, AxiosError } from 'axios';
import { APP_CONSTANTS } from '@/app/config/constants';
import { clearAllStorage, getAuthToken, clearAuthTokens } from '@/shared/utils/storageConversions';

interface RetryConfig {
  retries?: number;
  retryDelay?: (retryCount: number) => number;
  retryCondition?: (error: AxiosError) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: 3,
  retryDelay: (retryCount) => Math.pow(2, retryCount) * 1000, // Exponential backoff
  retryCondition: (error) => {
    // Retry on network errors or 5xx errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }
};

/**
 * Request interceptor for adding auth tokens
 */
export function setupAuthInterceptor(axiosInstance: AxiosInstance, getToken: () => string | null) {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

/**
 * Request interceptor for logging
 */
export function setupLoggingInterceptor(axiosInstance: AxiosInstance, logger?: Console) {
  const log = logger || console;
  
  axiosInstance.interceptors.request.use(
    (config) => {
      log.debug('[API Request]', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data
      });
      return config;
    },
    (error) => {
      log.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      log.debug('[API Response]', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
      return response;
    },
    (error) => {
      log.error('[API Response Error]', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data
      });
      return Promise.reject(error);
    }
  );
}

/**
 * Response interceptor for handling common errors
 */
export function setupErrorInterceptor(
  axiosInstance: AxiosInstance,
  handlers: {
    onUnauthorized?: () => void;
    onForbidden?: () => void;
    onNotFound?: () => void;
    onServerError?: (error: AxiosError) => void;
    onNetworkError?: (error: AxiosError) => void;
  }
) {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (!error.response) {
        // Network error
        handlers.onNetworkError?.(error);
      } else {
        switch (error.response.status) {
          case 401:
            handlers.onUnauthorized?.();
            break;
          case 403:
            handlers.onForbidden?.();
            break;
          case 404:
            handlers.onNotFound?.();
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            handlers.onServerError?.(error);
            break;
        }
      }
      return Promise.reject(error);
    }
  );
}

/**
 * Response interceptor for retry logic
 */
export function setupRetryInterceptor(
  axiosInstance: AxiosInstance,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
) {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const { config: requestConfig } = error;
      
      if (!requestConfig) {
        return Promise.reject(error);
      }

      // Get retry config from request or use defaults
      const extendedConfig = requestConfig as typeof requestConfig & {
        __retryConfig?: RetryConfig;
        __retryCount?: number;
      };
      const retryConfig = extendedConfig.__retryConfig || config;
      const currentRetryCount = extendedConfig.__retryCount || 0;

      if (
        currentRetryCount >= (retryConfig.retries || 0) ||
        !retryConfig.retryCondition?.(error)
      ) {
        return Promise.reject(error);
      }

      // Increment retry count
      extendedConfig.__retryCount = currentRetryCount + 1;
      extendedConfig.__retryConfig = retryConfig;

      // Calculate delay
      const delay = retryConfig.retryDelay?.(currentRetryCount) || 1000;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      return axiosInstance(requestConfig);
    }
  );
}

/**
 * Request interceptor for adding common headers
 */
export function setupCommonHeadersInterceptor(
  axiosInstance: AxiosInstance,
  headers: Record<string, string | (() => string)>
) {
  axiosInstance.interceptors.request.use(
    (config) => {
      Object.entries(headers).forEach(([key, value]) => {
        config.headers[key] = typeof value === 'function' ? value() : value;
      });
      return config;
    },
    (error) => Promise.reject(error)
  );
}

/**
 * Response interceptor for transforming response data
 */
export function setupTransformInterceptor<T = unknown>(
  axiosInstance: AxiosInstance,
  transform: (data: unknown) => T
) {
  axiosInstance.interceptors.response.use(
    (response) => {
      response.data = transform(response.data);
      return response;
    },
    (error) => Promise.reject(error)
  );
}

/**
 * Request interceptor for request timeout with custom message
 */
export function setupTimeoutInterceptor(
  axiosInstance: AxiosInstance,
  timeout: number = 30000,
  timeoutErrorMessage: string = 'Request timeout'
) {
  axiosInstance.interceptors.request.use(
    (config) => {
      config.timeout = config.timeout || timeout;
      config.timeoutErrorMessage = timeoutErrorMessage;
      return config;
    },
    (error) => Promise.reject(error)
  );
}

// Create and configure API client instance
export const apiClient = axios.create({
  baseURL: APP_CONSTANTS.API.BASE_URL,
  timeout: APP_CONSTANTS.API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup interceptors
setupCommonHeadersInterceptor(apiClient, {
  'X-Client-Version': '1.0.0',
  'X-Request-ID': () => `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
});

setupAuthInterceptor(apiClient, () => {
  return getAuthToken();
});

setupLoggingInterceptor(apiClient);

setupRetryInterceptor(apiClient, {
  retries: APP_CONSTANTS.API.RETRY_COUNT,
  retryDelay: (retryCount) => APP_CONSTANTS.API.RETRY_DELAY * retryCount,
});

setupErrorInterceptor(apiClient, {
  onUnauthorized: () => {
    // Clear all storage including branded types
    clearAllStorage();
    window.location.href = APP_CONSTANTS.ROUTES.LOGIN;
  },
  onNetworkError: (error) => {
    console.error('Network error:', error.message);
  },
  onServerError: (error) => {
    console.error('Server error:', error.response?.status, error.response?.data);
  },
});