/**
 * Lazy-loaded wrapper for GanttChart component
 * Reduces initial bundle size by code splitting
 */

import React, { lazy, Suspense } from 'react';
import { logger } from '@/utils/logger';

// Lazy load the GanttChart component
const GanttChart = lazy(() => import('./index'));

// Loading component
const GanttChartLoader: React.FC = () => (
  <div className="w-full h-full bg-white border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="mt-2 text-sm text-gray-600">간트 차트 로딩 중...</p>
    </div>
  </div>
);

// Error boundary for lazy loading
interface ErrorBoundaryState {
  hasError: boolean;
}

class GanttChartErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('GanttChart loading error:', error, { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-white border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">간트 차트를 불러오는 중 오류가 발생했습니다.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Exported lazy component with error boundary and loading state
const LazyGanttChart: React.FC = () => (
  <GanttChartErrorBoundary>
    <Suspense fallback={<GanttChartLoader />}>
      <GanttChart />
    </Suspense>
  </GanttChartErrorBoundary>
);

export default LazyGanttChart;