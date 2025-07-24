import { lazy } from 'react';
import { createLazyRoute } from '../utils/lazy-loading';

// Lazy load page components with proper error boundaries
export const DashboardPage = createLazyRoute(() => import('../pages/Dashboard'));
export const ProjectsPage = createLazyRoute(() => import('../pages/Projects'));
export const CustomersPage = createLazyRoute(() => import('../pages/Customers'));
export const UsersPage = createLazyRoute(() => import('../pages/Users'));
export const FactoriesPage = createLazyRoute(() => import('../pages/Factories'));
export const FactoryRegistrationPage = createLazyRoute(() => import('../pages/Factories/FactoryRegistration'));
export const NotFoundPage = createLazyRoute(() => import('../pages/NotFound'));

// Heavy components that should be code-split
export const LazyScheduleComponent = lazy(() => import('../components/Schedule'));
export const LazyGanttChart = lazy(() => import('../components/GanttChart'));
export const LazyProjectList = lazy(() => import('../components/ProjectList'));
export const LazyCustomerModal = lazy(() => import('../components/CustomerModal'));

// Route preloading utilities
export const preloadRoutes = {
  dashboard: () => import('../pages/Dashboard'),
  projects: () => import('../pages/Projects'), 
  customers: () => import('../pages/Customers'),
  users: () => import('../pages/Users'),
  factories: () => import('../pages/Factories'),
  factoryRegistration: () => import('../pages/Factories/FactoryRegistration'),
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
  DashboardStats: lazy(() => import('../components/Dashboard/DashboardStats')),
  RecentProjects: lazy(() => import('../components/Dashboard/RecentProjects')),
  
  // Projects specific components  
  ProjectFilters: lazy(() => import('../components/Projects/ProjectFilters')),
  ProjectTable: lazy(() => import('../components/Projects/ProjectTable')),
  
  // Heavy modals and overlays
  ProjectModal: lazy(() => import('../components/ProjectModal')),
  UserModal: lazy(() => import('../components/UserModal')),
  
  // Charts and visualization
  ProjectChart: lazy(() => import('../components/Charts/ProjectChart')),
  TimelineChart: lazy(() => import('../components/Charts/TimelineChart')),
};