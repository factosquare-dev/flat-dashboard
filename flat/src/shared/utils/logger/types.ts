// Logger types and interfaces

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  environment: string;
  service: string;
  url?: string;
  userAgent?: string;
}

export interface LogConfig {
  level: LogLevel;
  environment: string;
  service: string;
  remoteEndpoint?: string;
}

// Re-export types for better module resolution
export type { LogContext as LogContextType };
export type { LogEntry as LogEntryType };
export type { LogConfig as LogConfigType };