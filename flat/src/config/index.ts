// Application configuration

export const config = {
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
    language: 'en',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm',
    timezone: 'UTC',
  },

  // Feature flags
  features: {
    darkMode: true,
    multiLanguage: false,
    advancedFilters: true,
    exportData: true,
    bulkOperations: true,
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
} as const;

export type AppConfig = typeof config;