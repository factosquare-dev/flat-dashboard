// Re-export everything from the modular structure
export { ErrorBoundary as default } from './ErrorBoundary/index';
export { 
  ErrorBoundary, 
  withErrorBoundary, 
  PageErrorBoundary, 
  SectionErrorBoundary, 
  ComponentErrorBoundary,
  DefaultErrorFallback,
  ProjectListErrorFallback,
  ScheduleErrorFallback,
  ComponentErrorFallback as ComponentErrorFallbackComponent
} from './ErrorBoundary/index';
export type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary/index';