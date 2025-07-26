import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useProjects } from '../lib/react-query/hooks/useProjects';
import { useModalState } from '../hooks/common/useModalState';
import type { Project, Customer, Task, Participant } from '../types';

interface AppContextValue {
  // Project management
  projects: Project[];
  projectsLoading: boolean;
  projectsError: Error | null;
  refetchProjects: () => void;
  
  // Modal states
  customerModal: ReturnType<typeof useModalState>;
  taskModal: ReturnType<typeof useModalState>;
  projectModal: ReturnType<typeof useModalState>;
  
  // Data
  customers: Customer[];
  tasks: Task[];
  participants: Participant[];
  
  // Actions
  onProjectSave: (project: Partial<Project>) => void;
  onCustomerSave: (customer: Partial<Customer>) => void;
  onTaskSave: (task: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  onFactoryDelete: (factoryId: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
  // Optional props to override default data/actions
  customers?: Customer[];
  tasks?: Task[];
  participants?: Participant[];
  onProjectSave?: (project: Partial<Project>) => void;
  onCustomerSave?: (customer: Partial<Customer>) => void;
  onTaskSave?: (task: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  onFactoryDelete?: (factoryId: string) => void;
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  customers = [],
  tasks = [],
  participants = [],
  onProjectSave = () => {},
  onCustomerSave = () => {},
  onTaskSave = () => {},
  onTaskDelete = () => {},
  onFactoryDelete = () => {},
}) => {
  const { 
    data: projects = [], 
    isLoading: projectsLoading, 
    error: projectsError,
    refetch: refetchProjects 
  } = useProjects();
  
  const customerModal = useModalState();
  const taskModal = useModalState();
  const projectModal = useModalState();

  const value: AppContextValue = useMemo(
    () => ({
      // Project management
      projects,
      projectsLoading,
      projectsError,
      refetchProjects,
      
      // Modal states
      customerModal,
      taskModal,
      projectModal,
      
      // Data
      customers,
      tasks,
      participants,
      
      // Actions
      onProjectSave,
      onCustomerSave,
      onTaskSave,
      onTaskDelete,
      onFactoryDelete,
    }),
    [
      projects,
      projectsLoading,
      projectsError,
      refetchProjects,
      customerModal,
      taskModal,
      projectModal,
      customers,
      tasks,
      participants,
      onProjectSave,
      onCustomerSave,
      onTaskSave,
      onTaskDelete,
      onFactoryDelete,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Specialized hooks for specific contexts
export const useProjectContext = () => {
  const { projects, projectsLoading, projectsError, refetchProjects, projectModal, onProjectSave } = useAppContext();
  return { projects, projectsLoading, projectsError, refetchProjects, projectModal, onProjectSave };
};

export const useCustomerContext = () => {
  const { customers, customerModal, onCustomerSave } = useAppContext();
  return { customers, customerModal, onCustomerSave };
};

export const useTaskContext = () => {
  const { tasks, participants, taskModal, onTaskSave, onTaskDelete, onFactoryDelete } = useAppContext();
  return { tasks, participants, taskModal, onTaskSave, onTaskDelete, onFactoryDelete };
};