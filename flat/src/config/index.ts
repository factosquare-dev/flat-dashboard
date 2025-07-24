/**
 * Central configuration file for the application
 * All environment variables and configuration settings should be accessed through this file
 */

interface Config {
  api: {
    baseURL: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
    tokenExpiry: number;
  };
  ui: {
    theme: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
    timezone: string;
    animationDuration: number;
    debounceDelay: number;
    throttleDelay: number;
    toastDuration: number;
  };
  features: {
    darkMode: boolean;
    multiLanguage: boolean;
    advancedFilters: boolean;
    exportData: boolean;
    bulkOperations: boolean;
    enableMockData: boolean;
    enableDevTools: boolean;
    enableLogging: boolean;
  };
  pagination: {
    defaultPageSize: number;
    pageSizeOptions: number[];
  };
  upload: {
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  logging: {
    level: string;
    enableRemoteLogging: boolean;
    remoteEndpoint?: string;
  };
  performance: {
    enablePrefetch: boolean;
    cacheTimeout: number;
    debounceDelay: number;
    throttleDelay: number;
  };
  storage: {
    tokenKey: string;
    userKey: string;
    settingsKey: string;
    mockDbKey: string;
    legacyTokenKey: string;
    legacyAuthTokenKey: string;
  };
  validation: {
    maxFileSize: number;
    allowedFileTypes: string[];
    passwordMinLength: number;
    phonePattern: RegExp;
  };
}

export const config: Config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Authentication
  auth: {
    tokenKey: 'flat_auth_token',
    refreshTokenKey: 'flat_refresh_token',
    tokenExpiry: 60 * 60 * 24, // 24 hours
  },

  // UI Configuration
  ui: {
    theme: 'light',
    language: 'ko',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm',
    timezone: 'Asia/Seoul',
    animationDuration: 300,
    debounceDelay: 300,
    throttleDelay: 100,
    toastDuration: 3000,
  },

  // Feature flags
  features: {
    darkMode: true,
    multiLanguage: false,
    advancedFilters: true,
    exportData: true,
    bulkOperations: true,
    enableMockData: import.meta.env.VITE_ENABLE_MOCK === 'true',
    enableDevTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true' || import.meta.env.DEV,
    enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true' || import.meta.env.DEV,
  },

  // Pagination defaults
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // File upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },

  // Logging
  logging: {
    level: import.meta.env.VITE_LOG_LEVEL || 'info',
    enableRemoteLogging: import.meta.env.VITE_ENABLE_REMOTE_LOGGING === 'true',
    remoteEndpoint: import.meta.env.VITE_LOGGING_ENDPOINT,
  },

  // Performance
  performance: {
    enablePrefetch: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    debounceDelay: 300,
    throttleDelay: 100,
  },
  // Storage keys
  storage: {
    tokenKey: 'flat_auth_token',
    userKey: 'flat_user_data',
    settingsKey: 'flat_app_settings',
    mockDbKey: 'flat_mock_db',
    // Legacy keys (for backward compatibility)
    legacyTokenKey: 'auth_token',
    legacyAuthTokenKey: 'authToken',
  },

  // Validation rules
  validation: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    passwordMinLength: 8,
    phonePattern: /^010-\d{4}-\d{4}$/,
  },
} as const;

// Freeze config to prevent accidental mutations
const frozenConfig = Object.freeze(config);

export default frozenConfig;

// Export individual sections for convenience
export const apiConfig = frozenConfig.api;
export const authConfig = frozenConfig.auth;
export const uiConfig = frozenConfig.ui;
export const featureFlags = frozenConfig.features;
export const paginationConfig = frozenConfig.pagination;
export const uploadConfig = frozenConfig.upload;
export const loggingConfig = frozenConfig.logging;
export const performanceConfig = frozenConfig.performance;
export const storageKeys = frozenConfig.storage;
export const validationRules = frozenConfig.validation;

export type AppConfig = typeof config;