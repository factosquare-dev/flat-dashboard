/**
 * App Store using Zustand
 * Centralized state management for the FLAT Dashboard
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Project, Customer, Task, Participant } from '@/types';
import { generateProjectId, generateCustomerId, generateTaskId } from '@/shared/types/branded';

interface ModalState<T = unknown> {
  isOpen: boolean;
  data?: T;
}

interface AppState {
  // Project management
  projects: Project[];
  projectsLoading: boolean;
  projectsError: Error | null;
  
  // Modal states
  customerModal: ModalState<Customer | null>;
  taskModal: ModalState<Task | null>;
  projectModal: ModalState<Project | null>;
  
  // Data
  customers: Customer[];
  tasks: Task[];
  participants: Participant[];
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setProjectsLoading: (loading: boolean) => void;
  setProjectsError: (error: Error | null) => void;
  
  // Modal actions
  openCustomerModal: (data?: Customer | null) => void;
  closeCustomerModal: () => void;
  openTaskModal: (data?: Task | null) => void;
  closeTaskModal: () => void;
  openProjectModal: (data?: Project | null) => void;
  closeProjectModal: () => void;
  
  // Data actions
  setCustomers: (customers: Customer[]) => void;
  setTasks: (tasks: Task[]) => void;
  setParticipants: (participants: Participant[]) => void;
  
  // CRUD actions
  saveProject: (project: Partial<Project>) => void;
  saveCustomer: (customer: Partial<Customer>) => void;
  saveTask: (task: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  deleteFactory: (factoryId: string) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    subscribeWithSelector(
      immer((set) => ({
        // Initial state
        projects: [],
        projectsLoading: false,
        projectsError: null,
        
        customerModal: { isOpen: false },
        taskModal: { isOpen: false },
        projectModal: { isOpen: false },
        
        customers: [],
        tasks: [],
        participants: [],
        
        // Actions
        setProjects: (projects) => 
          set((state) => { state.projects = projects; }),
          
        setProjectsLoading: (loading) => 
          set((state) => { state.projectsLoading = loading; }),
          
        setProjectsError: (error) => 
          set((state) => { state.projectsError = error; }),
        
        // Modal actions
        openCustomerModal: (data) => 
          set((state) => { 
            state.customerModal = { isOpen: true, data }; 
          }),
          
        closeCustomerModal: () => 
          set((state) => { 
            state.customerModal = { isOpen: false }; 
          }),
          
        openTaskModal: (data) => 
          set((state) => { 
            state.taskModal = { isOpen: true, data }; 
          }),
          
        closeTaskModal: () => 
          set((state) => { 
            state.taskModal = { isOpen: false }; 
          }),
          
        openProjectModal: (data) => 
          set((state) => { 
            state.projectModal = { isOpen: true, data }; 
          }),
          
        closeProjectModal: () => 
          set((state) => { 
            state.projectModal = { isOpen: false }; 
          }),
        
        // Data actions
        setCustomers: (customers) => 
          set((state) => { state.customers = customers; }),
          
        setTasks: (tasks) => 
          set((state) => { state.tasks = tasks; }),
          
        setParticipants: (participants) => 
          set((state) => { state.participants = participants; }),
        
        // CRUD actions
        saveProject: (project) => 
          set((state) => {
            if (project.id) {
              // Update existing project
              const index = state.projects.findIndex(p => p.id === project.id);
              if (index !== -1) {
                state.projects[index] = { ...state.projects[index], ...project };
              }
            } else {
              // Add new project
              const newProject = {
                ...project,
                id: generateProjectId(),
              } as Project;
              state.projects.push(newProject);
            }
          }),
          
        saveCustomer: (customer) => 
          set((state) => {
            if (customer.id) {
              // Update existing customer
              const index = state.customers.findIndex(c => c.id === customer.id);
              if (index !== -1) {
                state.customers[index] = { ...state.customers[index], ...customer };
              }
            } else {
              // Add new customer
              const newCustomer = {
                ...customer,
                id: generateCustomerId(),
              } as Customer;
              state.customers.push(newCustomer);
            }
          }),
          
        saveTask: (task) => 
          set((state) => {
            if (task.id) {
              // Update existing task
              const index = state.tasks.findIndex(t => t.id === task.id);
              if (index !== -1) {
                state.tasks[index] = { ...state.tasks[index], ...task };
              }
            } else {
              // Add new task
              const newTask = {
                ...task,
                id: generateTaskId(),
              } as Task;
              state.tasks.push(newTask);
            }
          }),
          
        deleteTask: (taskId) => 
          set((state) => {
            state.tasks = state.tasks.filter(t => t.id !== taskId);
          }),
          
        deleteFactory: (factoryId) => 
          set((state) => {
            // Remove factory from all projects
            state.projects.forEach(project => {
              if (project.factories) {
                project.factories = project.factories.filter(f => f.id !== factoryId);
              }
            });
          }),
      }))
    ),
    {
      name: 'app-store', // name of the item in devtools
    }
  )
);

// Selectors for commonly used derived state
export const useProjectsData = () => useAppStore((state) => ({
  projects: state.projects,
  loading: state.projectsLoading,
  error: state.projectsError,
}));

export const useModalStates = () => useAppStore((state) => ({
  customerModal: state.customerModal,
  taskModal: state.taskModal,
  projectModal: state.projectModal,
}));

// Specialized hooks for specific contexts
export const useProjectContext = () => {
  const projects = useAppStore((state) => state.projects);
  const projectsLoading = useAppStore((state) => state.projectsLoading);
  const projectsError = useAppStore((state) => state.projectsError);
  const projectModal = useAppStore((state) => state.projectModal);
  const openProjectModal = useAppStore((state) => state.openProjectModal);
  const closeProjectModal = useAppStore((state) => state.closeProjectModal);
  const saveProject = useAppStore((state) => state.saveProject);
  
  return {
    projects,
    projectsLoading,
    projectsError,
    projectModal,
    openProjectModal,
    closeProjectModal,
    onProjectSave: saveProject,
  };
};

export const useCustomerContext = () => {
  const customers = useAppStore((state) => state.customers);
  const customerModal = useAppStore((state) => state.customerModal);
  const openCustomerModal = useAppStore((state) => state.openCustomerModal);
  const closeCustomerModal = useAppStore((state) => state.closeCustomerModal);
  const saveCustomer = useAppStore((state) => state.saveCustomer);
  
  return {
    customers,
    customerModal,
    openCustomerModal,
    closeCustomerModal,
    onCustomerSave: saveCustomer,
  };
};

export const useTaskContext = () => {
  const tasks = useAppStore((state) => state.tasks);
  const participants = useAppStore((state) => state.participants);
  const taskModal = useAppStore((state) => state.taskModal);
  const openTaskModal = useAppStore((state) => state.openTaskModal);
  const closeTaskModal = useAppStore((state) => state.closeTaskModal);
  const saveTask = useAppStore((state) => state.saveTask);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const deleteFactory = useAppStore((state) => state.deleteFactory);
  
  return {
    tasks,
    participants,
    taskModal,
    openTaskModal,
    closeTaskModal,
    onTaskSave: saveTask,
    onTaskDelete: deleteTask,
    onFactoryDelete: deleteFactory,
  };
};