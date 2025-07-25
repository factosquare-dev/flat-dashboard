/**
 * Lazy-loaded heavy components
 */

import { lazy } from 'react';

// Heavy components that should be lazy loaded
export const LazyGanttChart = lazy(() => import('./GanttChart'));
export const LazyScheduleComponent = lazy(() => import('./Schedule'));
export const LazyOptimizedTable = lazy(() => import('./OptimizedTable'));

// Chart components (usually heavy)
export const LazyChart = lazy(() => 
  import('../features/analytics/components/Chart').catch(() => ({
    default: () => <div className="flex-center h-64 text-gray-500">Chart not available</div>
  }))
);

// Dashboard components
export const LazyDashboardStats = lazy(() => 
  import('../features/dashboard/components/DashboardStats').catch(() => ({
    default: () => <div className="flex-center h-32 text-gray-500">Stats not available</div>
  }))
);

// Project components
export const LazyProjectDetails = lazy(() => 
  import('../features/projects/components/ProjectDetails').catch(() => ({
    default: () => <div className="flex-center h-64 text-gray-500">Project details not available</div>
  }))
);

// Calendar component (usually heavy due to date calculations)
export const LazyCalendar = lazy(() => 
  import('../components/Calendar').catch(() => ({
    default: () => <div className="flex-center h-64 text-gray-500">Calendar not available</div>
  }))
);

// File upload components
export const LazyFileUploader = lazy(() => 
  import('../components/FileUploader').catch(() => ({
    default: () => <div className="flex-center h-32 text-gray-500">File uploader not available</div>
  }))
);

// Rich text editor (usually very heavy)
export const LazyRichTextEditor = lazy(() => 
  import('../components/RichTextEditor').catch(() => ({
    default: () => <textarea className="w-full h-32 border border-gray-300 rounded p-2" placeholder="Rich text editor not available" />
  }))
);

// Data visualization components
export const LazyDataVisualization = lazy(() => 
  import('../features/analytics/components/DataVisualization').catch(() => ({
    default: () => <div className="flex-center h-64 text-gray-500">Data visualization not available</div>
  }))
);

// PDF viewer component
export const LazyPDFViewer = lazy(() => 
  import('../components/PDFViewer').catch(() => ({
    default: () => <div className="flex-center h-64 text-gray-500">PDF viewer not available</div>
  }))
);

// Report generator (heavy with complex calculations)
export const LazyReportGenerator = lazy(() => 
  import('../features/reports/components/ReportGenerator').catch(() => ({
    default: () => <div className="flex-center h-64 text-gray-500">Report generator not available</div>
  }))
);