import React, { createContext, useContext, useState, useCallback } from 'react';

// Base modal props that all modals should have
export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Generic modal config with proper typing
export interface ModalConfig<T extends BaseModalProps = BaseModalProps> {
  id: string;
  component: React.ComponentType<T>;
  props?: Omit<T, keyof BaseModalProps>;
}

// Type-safe modal registry
export type ModalConfigAny = ModalConfig<any>;

interface ModalContextType {
  modals: ModalConfigAny[];
  openModal: <T extends BaseModalProps>(config: ModalConfig<T>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  isModalOpen: (id: string) => boolean;
  updateModal: <T extends BaseModalProps>(id: string, props: Partial<Omit<T, keyof BaseModalProps>>) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// Type-safe modal hook with specific modal type
export function useTypedModal<T extends BaseModalProps>() {
  const modalContext = useModal();
  
  return {
    openModal: (config: ModalConfig<T>) => modalContext.openModal(config),
    updateModal: (id: string, props: Partial<Omit<T, keyof BaseModalProps>>) => 
      modalContext.updateModal(id, props),
    closeModal: modalContext.closeModal,
    closeAllModals: modalContext.closeAllModals,
    isModalOpen: modalContext.isModalOpen
  };
}

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalConfigAny[]>([]);

  const openModal = useCallback(<T extends BaseModalProps>(config: ModalConfig<T>) => {
    setModals(prev => {
      // Prevent duplicate modals
      const exists = prev.some(modal => modal.id === config.id);
      if (exists) {
        return prev.map(modal => 
          modal.id === config.id ? { ...modal, ...config } : modal
        );
      }
      return [...prev, config as ModalConfigAny];
    });
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  const isModalOpen = useCallback((id: string) => {
    return modals.some(modal => modal.id === id);
  }, [modals]);

  const updateModal = useCallback(<T extends BaseModalProps>(
    id: string, 
    props: Partial<Omit<T, keyof BaseModalProps>>
  ) => {
    setModals(prev => prev.map(modal => 
      modal.id === id 
        ? { ...modal, props: { ...modal.props, ...props } }
        : modal
    ));
  }, []);

  return (
    <ModalContext.Provider value={{ 
      modals, 
      openModal, 
      closeModal, 
      closeAllModals, 
      isModalOpen,
      updateModal 
    }}>
      {children}
      {modals.map(({ id, component: Component, props }) => (
        <Component
          key={id}
          {...(props as any)}
          isOpen={true}
          onClose={() => closeModal(id)}
        />
      ))}
    </ModalContext.Provider>
  );
};

// Example usage:
// interface MyModalProps extends BaseModalProps {
//   title: string;
//   message: string;
// }
// 
// const { openModal } = useTypedModal<MyModalProps>();
// openModal({
//   id: 'my-modal',
//   component: MyModal,
//   props: {
//     title: 'Hello',
//     message: 'World'
//   }
// });