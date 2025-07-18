import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ModalConfig {
  id: string;
  component: React.ComponentType<any>;
  props?: any;
}

interface ModalContextType {
  modals: ModalConfig[];
  openModal: (config: ModalConfig) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalConfig[]>([]);

  const openModal = useCallback((config: ModalConfig) => {
    setModals(prev => {
      // Prevent duplicate modals
      const exists = prev.some(modal => modal.id === config.id);
      if (exists) {
        return prev.map(modal => 
          modal.id === config.id ? { ...modal, ...config } : modal
        );
      }
      return [...prev, config];
    });
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal, closeAllModals }}>
      {children}
      {modals.map(({ id, component: Component, props }) => (
        <Component
          key={id}
          {...props}
          isOpen={true}
          onClose={() => closeModal(id)}
        />
      ))}
    </ModalContext.Provider>
  );
};