/**
 * Lazy loading modal component with dynamic imports
 */

import React, { Suspense, lazy, useMemo } from 'react';

interface LazyModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType: string;
  modalProps?: Record<string, unknown>;
  fallback?: React.ComponentType;
}

// Modal component registry for dynamic imports
const modalComponents = {
  'project-create': () => import('../../features/projects/components/ProjectCreateModal'),
  'project-edit': () => import('../../features/projects/components/ProjectEditModal'),
  'project-delete': () => import('../../features/projects/components/ProjectDeleteModal'),
  'task-create': () => import('../../components/Schedule/components/TaskCreateModal'),
  'task-edit': () => import('../../components/Schedule/components/TaskEditModal'),
  'task-delete': () => import('../../components/Schedule/components/TaskDeleteModal'),
  'factory-create': () => import('../../features/factories/components/FactoryCreateModal'),
  'factory-edit': () => import('../../features/factories/components/FactoryEditModal'),
  'user-create': () => import('../../features/users/components/UserCreateModal'),
  'user-edit': () => import('../../features/users/components/UserEditModal'),
  'email-compose': () => import('../../features/email/components/ComposeEmailModal'),
  'workflow-create': () => import('../../features/workflow/components/WorkflowCreateModal'),
  'settings': () => import('../../features/settings/components/SettingsModal'),
  'confirmation': () => import('./ConfirmationModal'),
} as const;

// Default loading fallback component
const DefaultFallback: React.FC = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    </div>
  </div>
);

const LazyModal: React.FC<LazyModalProps> = ({
  isOpen,
  onClose,
  modalType,
  modalProps = {},
  fallback: FallbackComponent = DefaultFallback,
}) => {
  // Memoize the lazy component to prevent re-creation on every render
  const LazyModalComponent = useMemo(() => {
    const importFn = modalComponents[modalType as keyof typeof modalComponents];
    
    if (!importFn) {
      console.warn(`Modal type "${modalType}" not found in registry`);
      return null;
    }
    
    return lazy(importFn);
  }, [modalType]);

  // Don't render anything if modal is not open or component not found
  if (!isOpen || !LazyModalComponent) {
    return null;
  }

  return (
    <Suspense fallback={<FallbackComponent />}>
      <LazyModalComponent
        isOpen={isOpen}
        onClose={onClose}
        {...modalProps}
      />
    </Suspense>
  );
};

export default React.memo(LazyModal);

// Hook for managing lazy modals
interface UseModalState {
  isOpen: boolean;
  modalType: string | null;
  modalProps: Record<string, unknown>;
}

export function useLazyModal() {
  const [modalState, setModalState] = React.useState<UseModalState>({
    isOpen: false,
    modalType: null,
    modalProps: {},
  });

  const openModal = React.useCallback((
    modalType: keyof typeof modalComponents,
    modalProps: Record<string, unknown> = {}
  ) => {
    setModalState({
      isOpen: true,
      modalType,
      modalProps,
    });
  }, []);

  const closeModal = React.useCallback(() => {
    setModalState({
      isOpen: false,
      modalType: null,
      modalProps: {},
    });
  }, []);

  const updateModalProps = React.useCallback((newProps: Record<string, unknown>) => {
    setModalState(prev => ({
      ...prev,
      modalProps: { ...prev.modalProps, ...newProps },
    }));
  }, []);

  return {
    modalState,
    openModal,
    closeModal,
    updateModalProps,
  };
}

// Modal provider context for global modal management
interface ModalContextValue {
  openModal: (
    modalType: keyof typeof modalComponents,
    modalProps?: Record<string, unknown>
  ) => void;
  closeModal: () => void;
  updateModalProps: (newProps: Record<string, unknown>) => void;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

interface ModalProviderProps {
  children: React.ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const { modalState, openModal, closeModal, updateModalProps } = useLazyModal();

  const contextValue = useMemo(
    () => ({ openModal, closeModal, updateModalProps }),
    [openModal, closeModal, updateModalProps]
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <LazyModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        modalType={modalState.modalType || ''}
        modalProps={modalState.modalProps}
      />
    </ModalContext.Provider>
  );
};

// Hook to use modal context
export function useModal(): ModalContextValue {
  const context = React.useContext(ModalContext);
  
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  
  return context;
}

// Export modal types for type safety
export type ModalType = keyof typeof modalComponents;