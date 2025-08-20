import { useState } from 'react';

export interface ModalState {
  email: boolean;
  workflow: boolean;
  taskEdit: boolean;
  productRequest: boolean;
}

export interface UseModalsReturn {
  modals: ModalState;
  openModal: (modal: keyof ModalState) => void;
  closeModal: (modal: keyof ModalState) => void;
  toggleModal: (modal: keyof ModalState) => void;
}

export const useModals = (): UseModalsReturn => {
  const [modals, setModals] = useState<ModalState>({
    email: false,
    workflow: false,
    taskEdit: false,
    productRequest: false,
  });

  const openModal = (modal: keyof ModalState) => {
    setModals(prev => ({ ...prev, [modal]: true }));
  };

  const closeModal = (modal: keyof ModalState) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  };

  const toggleModal = (modal: keyof ModalState) => {
    setModals(prev => ({ ...prev, [modal]: !prev[modal] }));
  };

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
  };
};