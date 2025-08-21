import { useAppStore } from '../appStore';
import { shallow } from 'zustand/shallow';
// import type { RootState } from '@/index';
import { ProjectStatus } from '@/shared/types/enums';

/**
 * Performance-optimized store hooks with memoization
 * Use these hooks instead of directly using useAppStore to prevent unnecessary re-renders
 */

// Project-related hooks
export const useProjects = () => useAppStore((state) => state.projects);
export const useProjectActions = () => useAppStore(
  (state) => ({
    setProjects: state.setProjects,
    addProject: state.addProject,
    updateProject: state.updateProject,
    deleteProject: state.deleteProject,
  }),
  shallow
);

export const useProjectById = (id: string) => useAppStore(
  (state) => state.projects.find(p => p.id === id)
);

export const useFilteredProjects = () => {
  const projects = useAppStore((state) => state.projects);
  const filters = useAppStore((state) => state.filters);
  
  return projects.filter(project => {
    // Apply filters logic here
    if (filters?.status && project.status !== filters.status) return false;
    if (filters?.search && !project.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
};

// User-related hooks
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => !!state.user);
export const useUserRole = () => useAppStore((state) => state.user?.role);

export const useAuthActions = () => useAppStore(
  (state) => ({
    setUser: state.setUser,
    logout: state.logout,
  }),
  shallow
);

// UI-related hooks
export const useTheme = () => useAppStore((state) => state.theme);
export const useSidebarCollapsed = () => useAppStore((state) => state.sidebarCollapsed);
export const useNotifications = () => useAppStore((state) => state.notifications);

export const useUIActions = () => useAppStore(
  (state) => ({
    setTheme: state.setTheme,
    toggleSidebar: state.toggleSidebar,
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
  }),
  shallow
);

// Combined selectors for complex state derivations
export const useAppStatus = () => useAppStore(
  (state) => ({
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: !!state.user,
  }),
  shallow
);

// Memoized selectors using createSelector
const projectCountSelector = (state: RootState) => state.projects.length;
const activeProjectsSelector = (state: RootState) => 
  state.projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;
const completedProjectsSelector = (state: RootState) => 
  state.projects.filter(p => p.status === ProjectStatus.COMPLETED).length;

export const useProjectStats = () => useAppStore(
  createSelector(
    [projectCountSelector, activeProjectsSelector, completedProjectsSelector],
    (total, active, completed) => ({
      total,
      active,
      completed,
      pending: total - active - completed,
    })
  )
);

// Performance-optimized subscription hook
export const useAppStoreSubscription = <T>(
  selector: (state: RootState) => T,
  callback: (value: T) => void,
  equalityFn = Object.is
) => {
  const store = useAppStore;
  
  React.useEffect(() => {
    const unsubscribe = store.subscribe(
      selector,
      callback,
      { equalityFn }
    );
    
    return unsubscribe;
  }, []);
};