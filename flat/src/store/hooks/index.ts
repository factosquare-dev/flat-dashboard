import { useStore } from '../index';
import { shallow } from 'zustand/shallow';
import { createSelector } from 'zustand';
import type { RootState } from '../index';

/**
 * Performance-optimized store hooks with memoization
 * Use these hooks instead of directly using useStore to prevent unnecessary re-renders
 */

// Project-related hooks
export const useProjects = () => useStore((state) => state.projects);
export const useProjectActions = () => useStore(
  (state) => ({
    setProjects: state.setProjects,
    addProject: state.addProject,
    updateProject: state.updateProject,
    deleteProject: state.deleteProject,
  }),
  shallow
);

export const useProjectById = (id: string) => useStore(
  (state) => state.projects.find(p => p.id === id)
);

export const useFilteredProjects = () => {
  const projects = useStore((state) => state.projects);
  const filters = useStore((state) => state.filters);
  
  return projects.filter(project => {
    // Apply filters logic here
    if (filters?.status && project.status !== filters.status) return false;
    if (filters?.search && !project.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
};

// User-related hooks
export const useUser = () => useStore((state) => state.user);
export const useIsAuthenticated = () => useStore((state) => !!state.user);
export const useUserRole = () => useStore((state) => state.user?.role);

export const useAuthActions = () => useStore(
  (state) => ({
    setUser: state.setUser,
    logout: state.logout,
  }),
  shallow
);

// UI-related hooks
export const useTheme = () => useStore((state) => state.theme);
export const useSidebarCollapsed = () => useStore((state) => state.sidebarCollapsed);
export const useNotifications = () => useStore((state) => state.notifications);

export const useUIActions = () => useStore(
  (state) => ({
    setTheme: state.setTheme,
    toggleSidebar: state.toggleSidebar,
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
  }),
  shallow
);

// Combined selectors for complex state derivations
export const useAppStatus = () => useStore(
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
  state.projects.filter(p => p.status === 'active').length;
const completedProjectsSelector = (state: RootState) => 
  state.projects.filter(p => p.status === 'completed').length;

export const useProjectStats = () => useStore(
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
export const useStoreSubscription = <T>(
  selector: (state: RootState) => T,
  callback: (value: T) => void,
  equalityFn = Object.is
) => {
  const store = useStore;
  
  React.useEffect(() => {
    const unsubscribe = store.subscribe(
      selector,
      callback,
      { equalityFn }
    );
    
    return unsubscribe;
  }, []);
};