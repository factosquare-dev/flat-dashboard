/**
 * Migration utilities from Context API to Zustand
 * Provides compatibility layer for gradual migration
 */

import React, { useEffect } from 'react';
import { useAppStore } from '@/appStore';
import { useModalStore } from '@/modalStore';
import type { Project, Customer, Task, Participant } from '@/types';

/**
 * Compatibility wrapper for AppContext
 * Use this to gradually migrate components from Context to Zustand
 */
export const AppContextCompatibilityProvider: React.FC<{
  children: React.ReactNode;
  customers?: Customer[];
  tasks?: Task[];
  participants?: Participant[];
  onProjectSave?: (project: Partial<Project>) => void;
  onCustomerSave?: (customer: Partial<Customer>) => void;
  onTaskSave?: (task: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  onFactoryDelete?: (factoryId: string) => void;
}> = ({
  children,
  customers = [],
  tasks = [],
  participants = [],
  onProjectSave,
  onCustomerSave,
  onTaskSave,
  onTaskDelete,
  onFactoryDelete,
}) => {
  const setCustomers = useAppStore((state) => state.setCustomers);
  const setTasks = useAppStore((state) => state.setTasks);
  const setParticipants = useAppStore((state) => state.setParticipants);
  const saveProject = useAppStore((state) => state.saveProject);
  const saveCustomer = useAppStore((state) => state.saveCustomer);
  const saveTask = useAppStore((state) => state.saveTask);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const deleteFactory = useAppStore((state) => state.deleteFactory);

  // Sync initial data to store
  useEffect(() => {
    setCustomers(customers);
  }, [customers, setCustomers]);

  useEffect(() => {
    setTasks(tasks);
  }, [tasks, setTasks]);

  useEffect(() => {
    setParticipants(participants);
  }, [participants, setParticipants]);

  // Override store actions with provided callbacks if available
  useEffect(() => {
    if (onProjectSave) {
      // Create a subscription to handle custom save logic
      const unsubscribe = useAppStore.subscribe(
        (state) => state.projects,
        (projects, prevProjects) => {
          // Handle custom save logic when projects change
          const lastProject = projects[projects.length - 1];
          if (projects.length > prevProjects.length) {
            onProjectSave(lastProject);
          }
        }
      );
      return unsubscribe;
    }
  }, [onProjectSave]);

  return <>{children}</>;
};

/**
 * Modal Context compatibility layer
 */
export const ModalRenderer: React.FC = () => {
  const modals = useModalStore((state) => state.modals);
  const closeModal = useModalStore((state) => state.closeModal);

  return (
    <>
      {modals.map(({ id, component: Component, props }) => (
        <Component
          key={id}
          {...props}
          isOpen={true}
          onClose={() => closeModal(id)}
        />
      ))}
    </>
  );
};

/**
 * Migration hooks - drop-in replacements for Context hooks
 */

// Replace useAppContext with direct store usage
export const useAppContext = () => {
  // Deprecated: Use Zustand hooks directly
  
  const state = useAppStore();
  const modalState = useModalStore();
  
  return {
    // Project management
    projects: state.projects,
    projectsLoading: state.projectsLoading,
    projectsError: state.projectsError,
    refetchProjects: () => {}, // Handled by React Query
    
    // Modal states (compatibility)
    customerModal: {
      isOpen: state.customerModal.isOpen,
      open: () => state.openCustomerModal(),
      close: () => state.closeCustomerModal(),
    },
    taskModal: {
      isOpen: state.taskModal.isOpen,
      open: () => state.openTaskModal(),
      close: () => state.closeTaskModal(),
    },
    projectModal: {
      isOpen: state.projectModal.isOpen,
      open: () => state.openProjectModal(),
      close: () => state.closeProjectModal(),
    },
    
    // Data
    customers: state.customers,
    tasks: state.tasks,
    participants: state.participants,
    
    // Actions
    onProjectSave: state.saveProject,
    onCustomerSave: state.saveCustomer,
    onTaskSave: state.saveTask,
    onTaskDelete: state.deleteTask,
    onFactoryDelete: state.deleteFactory,
  };
};

// Replace useModal with useModalStore
export const useModal = () => {
  // Deprecated: Use useModalStore directly
  return useModalStore();
};