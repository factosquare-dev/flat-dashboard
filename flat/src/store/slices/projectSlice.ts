import type { Project } from '../../types/project';
import type { StateCreator } from 'zustand';

export interface ProjectSlice {
  // State
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status: string[];
    serviceType: string[];
    dateRange: { start: Date | null; end: Date | null };
  };

  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectProject: (project: Project | null) => void;
  setFilters: (filters: Partial<ProjectSlice['filters']>) => void;
  resetFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialFilters = {
  status: [],
  serviceType: [],
  dateRange: { start: null, end: null },
};

export const projectSlice: StateCreator<ProjectSlice> = (set) => ({
  // Initial state
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
  filters: initialFilters,

  // Actions
  setProjects: (projects) => set({ projects }),
  
  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project],
    })),
  
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      selectedProject:
        state.selectedProject?.id === id
          ? { ...state.selectedProject, ...updates }
          : state.selectedProject,
    })),
  
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProject:
        state.selectedProject?.id === id ? null : state.selectedProject,
    })),
  
  selectProject: (project) => set({ selectedProject: project }),
  
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  
  resetFilters: () => set({ filters: initialFilters }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
});