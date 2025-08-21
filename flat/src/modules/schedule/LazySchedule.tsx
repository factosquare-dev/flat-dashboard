/**
 * Lazy-loaded wrapper for Schedule component
 * Improves initial load performance through code splitting
 */

import React, { lazy, Suspense } from 'react';
import type { ScheduleProps } from './ScheduleComponent/types';

// Lazy load the Schedule component
const Schedule = lazy(() => import('./ScheduleComponent'));

// Loading component
const ScheduleLoader: React.FC = () => (
  <div className="w-full h-[600px] bg-gray-50 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="inline-flex items-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">스케줄 로딩 중...</span>
      </div>
    </div>
  </div>
);

// Error boundary for lazy loading
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ScheduleErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Schedule loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[600px] bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="text-red-600">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700">스케줄을 불러오는 중 오류가 발생했습니다.</p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Exported lazy component with error boundary and loading state
const LazySchedule: React.FC<ScheduleProps> = (props) => (
  <ScheduleErrorBoundary>
    <Suspense fallback={<ScheduleLoader />}>
      <Schedule {...props} />
    </Suspense>
  </ScheduleErrorBoundary>
);

export default LazySchedule;