/**
 * Logging hooks for comprehensive application monitoring
 * 
 * Re-exports the refactored modular logging hooks
 */

export {
  useComponentLogging,
  useNavigationLogging,
  useApiLogging,
  useUserActionLogging,
  usePerformanceLogging,
  useErrorLogging,
  useSessionLogging,
  PERFORMANCE_CONSTANTS
} from './useLogging/index';