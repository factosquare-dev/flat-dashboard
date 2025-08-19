import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Project, ProjectFilter } from '@/features/types';

interface ProjectStore {
  // State
  projects: Project[];
  selectedProject: Project | null;
  filters: ProjectFilter;
  loading: boolean;
  error: string | null;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectProject: (project: Project | null) => void;
  setFilters: (filters: ProjectFilter) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  projects: [],
  selectedProject: null,
  filters: {},
  loading: false,
  error: null,
};

export const useProjectStore = create<ProjectStore>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,
        
        setProjects: (projects) =>
          set((state) => {
            state.projects = projects;
          }),
          
        addProject: (project) =>
          set((state) => {
            state.projects.push(project);
          }),
          
        updateProject: (id, updates) =>
          set((state) => {
            const index = state.projects.findIndex((p) => p.id === id);
            if (index !== -1) {
              state.projects[index] = { ...state.projects[index], ...updates };
              if (state.selectedProject?.id === id) {
                state.selectedProject = { ...state.selectedProject, ...updates };
              }
            }
          }),
          
        deleteProject: (id) =>
          set((state) => {
            state.projects = state.projects.filter((p) => p.id !== id);
            if (state.selectedProject?.id === id) {
              state.selectedProject = null;
            }
          }),
          
        selectProject: (project) =>
          set((state) => {
            state.selectedProject = project;
          }),
          
        setFilters: (filters) =>
          set((state) => {
            state.filters = filters;
          }),
          
        setLoading: (loading) =>
          set((state) => {
            state.loading = loading;
          }),
          
        setError: (error) =>
          set((state) => {
            state.error = error;
          }),
          
        reset: () => set(() => initialState),
      })),
      {
        name: 'project-store',
        partialize: (state) => ({
          filters: state.filters,
          selectedProject: state.selectedProject,
        }),
      }
    ),
    {
      name: 'ProjectStore',
    }
  )
);