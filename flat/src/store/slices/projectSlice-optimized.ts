import { produce } from 'immer';
import type { Project } from '@/types/project';
import { createImmerUpdater, createAsyncAction } from '@/utils/store/storeUtils';
import { projectsApi } from '@/api/projects';
import { ProjectStatus, getProjectStatusFromLabel } from '@/types/enums';
import type { StateCreator } from 'zustand';

export interface ProjectFilters {
  status: string[];
  serviceType: string[];
  dateRange: { start: Date | null; end: Date | null };
  search: string;
}

export interface ProjectSlice {
  // State
  projects: Project[];
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  filters: ProjectFilters;
  
  // Computed (will be created as selectors)
  filteredProjects: Project[];
  selectedProject: Project | null;

  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string | null) => void;
  setFilters: (filters: Partial<ProjectFilters>) => void;
  resetFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  fetchProjects: () => Promise<void>;
  saveProject: (project: Project) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
}

const initialFilters: ProjectFilters = {
  status: [],
  serviceType: [],
  dateRange: { start: null, end: null },
  search: '',
};

export const createProjectSlice: StateCreator<ProjectSlice> = (set, get) => {
  const immerSet = createImmerUpdater<ProjectSlice>(set);
  
  return {
    // Initial state
    projects: [],
    selectedProjectId: null,
    isLoading: false,
    error: null,
    filters: initialFilters,

    // Computed getters (these will be used in selectors)
    get filteredProjects() {
      const state = get() as ProjectSlice;
      const { projects, filters } = state;
      
      return projects.filter(project => {
        // Status filter
        if (filters.status.length > 0 && !filters.status.includes(project.status)) {
          return false;
        }
        
        // Service type filter
        if (filters.serviceType.length > 0 && !filters.serviceType.includes(project.serviceType)) {
          return false;
        }
        
        // Date range filter
        if (filters.dateRange.start || filters.dateRange.end) {
          const projectDate = new Date(project.startDate);
          if (filters.dateRange.start && projectDate < filters.dateRange.start) return false;
          if (filters.dateRange.end && projectDate > filters.dateRange.end) return false;
        }
        
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            project.name.toLowerCase().includes(searchLower) ||
            project.customer?.toLowerCase().includes(searchLower) ||
            project.description?.toLowerCase().includes(searchLower)
          );
        }
        
        return true;
      });
    },
    
    get selectedProject() {
      const state = get() as ProjectSlice;
      return state.selectedProjectId 
        ? state.projects.find(p => p.id === state.selectedProjectId) || null
        : null;
    },

    // Optimized actions using Immer
    setProjects: (projects: Project[]) => 
      immerSet(draft => {
        draft.projects = projects;
      }),
    
    addProject: (project: Project) =>
      immerSet(draft => {
        draft.projects.push(project);
      }),
    
    updateProject: (id: string, updates: Partial<Project>) =>
      immerSet(draft => {
        const index = draft.projects.findIndex(p => p.id === id);
        if (index !== -1) {
          Object.assign(draft.projects[index], updates);
        }
      }),
    
    deleteProject: (id: string) =>
      immerSet(draft => {
        const index = draft.projects.findIndex(p => p.id === id);
        if (index !== -1) {
          draft.projects.splice(index, 1);
          // Clear selection if deleted project was selected
          if (draft.selectedProjectId === id) {
            draft.selectedProjectId = null;
          }
        }
      }),
    
    selectProject: (id: string | null) =>
      set({ selectedProjectId: id }),
    
    setFilters: (filters: Partial<ProjectFilters>) =>
      immerSet(draft => {
        Object.assign(draft.filters, filters);
      }),
    
    resetFilters: () =>
      set({ filters: initialFilters }),
    
    setLoading: (isLoading: boolean) =>
      set({ isLoading }),
    
    setError: (error: string | null) =>
      set({ error }),
    
    // Async actions with built-in loading/error handling
    fetchProjects: createAsyncAction<ProjectSlice>(
      set,
      async () => {
        const response = await projectsApi.getProjects();
        set({ projects: response.data });
      }
    ),
    
    saveProject: createAsyncAction<ProjectSlice>(
      set,
      async (project: Project) => {
        let savedProject: Project;
        
        if (project.id) {
          // Update existing project
          savedProject = await projectsApi.updateProject({
            id: project.id,
            name: project.name,
            description: project.description,
            startDate: project.startDate,
            endDate: project.endDate,
            customerId: project.customerId,
            status: getProjectStatusFromLabel(project.status) || ProjectStatus.PLANNING,
            budget: project.totalAmount
          });
        } else {
          // Create new project
          savedProject = await projectsApi.createProject({
            name: project.name || '',
            description: project.description,
            startDate: project.startDate,
            endDate: project.endDate,
            customerId: project.customerId || project.client || '',
            status: getProjectStatusFromLabel(project.status) || ProjectStatus.PLANNING,
            budget: project.totalAmount
          });
        }
        
        immerSet(draft => {
          if (project.id) {
            // Update existing
            const index = draft.projects.findIndex(p => p.id === project.id);
            if (index !== -1) {
              draft.projects[index] = savedProject;
            }
          } else {
            // Add new
            draft.projects.push(savedProject);
          }
        });
      }
    ),
    
    removeProject: createAsyncAction<ProjectSlice>(
      set,
      async (id: string) => {
        await projectsApi.deleteProject(id);
        
        immerSet(draft => {
          const index = draft.projects.findIndex(p => p.id === id);
          if (index !== -1) {
            draft.projects.splice(index, 1);
            if (draft.selectedProjectId === id) {
              draft.selectedProjectId = null;
            }
          }
        });
      }
    ),
  };
};

// Memoized selectors for use in components
export const projectSelectors = {
  getProjectById: (id: string) => (state: ProjectSlice) => 
    state.projects.find(p => p.id === id),
    
  getProjectsByStatus: (status: string) => (state: ProjectSlice) =>
    state.projects.filter(p => p.status === status),
    
  getProjectCount: (state: ProjectSlice) => state.projects.length,
  
  getActiveProjects: (state: ProjectSlice) =>
    state.projects.filter(p => p.status === ProjectStatus.IN_PROGRESS),
    
  getProjectStats: (state: ProjectSlice) => {
    const stats = {
      total: state.projects.length,
      active: 0,
      completed: 0,
      pending: 0,
    };
    
    state.projects.forEach(project => {
      switch (project.status) {
        case ProjectStatus.IN_PROGRESS:
          stats.active++;
          break;
        case ProjectStatus.COMPLETED:
          stats.completed++;
          break;
        case ProjectStatus.PLANNING:
          stats.pending++;
          break;
        case ProjectStatus.CANCELLED:
          // Count cancelled projects separately if needed
          break;
      }
    });
    
    return stats;
  },
};