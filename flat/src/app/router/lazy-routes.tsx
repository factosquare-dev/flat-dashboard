import { lazy } from 'react';
import { createLazyRoute } from '@/shared/utils/lazy-loading';

// Lazy load page components with proper error boundaries
export const DashboardPage = createLazyRoute(() => import('@/modules/dashboard/index'));
export const ProjectsPage = createLazyRoute(() => import('@/modules/projects/ProjectsPage'));
export const CustomersPage = createLazyRoute(() => import('@/modules/customers/index'));
export const UsersPage = createLazyRoute(() => import('@/modules/users/index'));
export const FactoriesPage = createLazyRoute(() => import('@/modules/factories/index'));
export const FactoryRegistrationPage = createLazyRoute(() => import('@/modules/factories/FactoryRegistration'));
export const NotFoundPage = createLazyRoute(() => import('@/misc/NotFound'));

// Heavy components that should be code-split
export const LazyScheduleComponent = lazy(() => import('@/modules/schedule/ScheduleComponent'));
export const LazyGanttChart = lazy(() => import('@/components/GanttChart'));
export const LazyProjectList = lazy(() => import('@/modules/projects/components/ProjectList'));
export const LazyCustomerModal = lazy(() => import('@/modules/customers/components/CustomerModal'));

// Route preloading utilities
export const preloadRoutes = {
  dashboard: () => import('@/modules/dashboard/index'),
  projects: () => import('@/modules/projects/ProjectsPage'), 
  customers: () => import('@/modules/customers/index'),
  users: () => import('@/modules/users/index'),
  factories: () => import('@/modules/factories/index'),
  factoryRegistration: () => import('@/modules/factories/FactoryRegistration'),
};

// Preload commonly accessed routes
export const preloadCommonRoutes = () => {
  // Preload dashboard and projects as they're most commonly accessed
  setTimeout(() => {
    preloadRoutes.dashboard();
    preloadRoutes.projects();
  }, 2000);
  
  // Preload customers after a longer delay
  setTimeout(() => {
    preloadRoutes.customers();
  }, 5000);
};

// Route-specific component splitting
export const LazyRouteComponents = {
  // Dashboard specific components
  DashboardStats: lazy(() => import('@/modules/dashboard/components/DashboardStats')),
  RecentProjects: lazy(() => import('@/modules/dashboard/components/RecentProjects')),
  
  // Projects specific components  
  ProjectFilters: lazy(() => import('@/modules/projects/components/ProjectFilters')),
  ProjectTable: lazy(() => import('@/modules/projects/components/ProjectTable')),
  
  // Heavy modals and overlays
  ProjectModal: lazy(() => import('@/modules/projects/components/ProjectModal')),
  UserModal: lazy(() => import('@/modules/users/components/UserModal')),
  
  // Charts and visualization
  ProjectChart: lazy(() => import('@/shared/components/Charts/ProjectChart')),
  TimelineChart: lazy(() => import('@/shared/components/Charts/TimelineChart')),
};