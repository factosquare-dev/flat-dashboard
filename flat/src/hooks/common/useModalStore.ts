/**
 * Modal management hook using Zustand store
 * Provides type-safe modal management with global state
 */

import { useCallback } from 'react';
import { useModalStore } from '../../stores/modalStore';
import type { BaseModalProps, ModalConfig } from '../../stores/modalStore';

/**
 * Hook for managing a single modal instance
 */
interface UseModalOptions<T extends BaseModalProps = BaseModalProps> {
  modalId: string;
  component: React.ComponentType<T>;
  defaultProps?: Omit<T, keyof BaseModalProps>;
}

interface UseModalReturn<T extends BaseModalProps = BaseModalProps> {
  isOpen: boolean;
  open: (props?: Partial<Omit<T, keyof BaseModalProps>>) => void;
  close: () => void;
  update: (props: Partial<Omit<T, keyof BaseModalProps>>) => void;
}

export function useModal<T extends BaseModalProps = BaseModalProps>({
  modalId,
  component,
  defaultProps,
}: UseModalOptions<T>): UseModalReturn<T> {
  const { modals, openModal, closeModal, updateModal } = useModalStore();
  
  const isOpen = modals.some(modal => modal.id === modalId);
  
  const open = useCallback((props?: Partial<Omit<T, keyof BaseModalProps>>) => {
    openModal<T>({
      id: modalId,
      component,
      props: { ...defaultProps, ...props } as Omit<T, keyof BaseModalProps>,
    });
  }, [modalId, component, defaultProps, openModal]);
  
  const close = useCallback(() => {
    closeModal(modalId);
  }, [modalId, closeModal]);
  
  const update = useCallback((props: Partial<Omit<T, keyof BaseModalProps>>) => {
    updateModal(modalId, props);
  }, [modalId, updateModal]);
  
  return {
    isOpen,
    open,
    close,
    update,
  };
}

/**
 * Hook for managing multiple modals
 */
export function useModals() {
  const { 
    modals, 
    openModal, 
    closeModal, 
    closeAllModals,
    isModalOpen 
  } = useModalStore();
  
  return {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
  };
}

/**
 * Hook for accessing global modal state
 * Useful for rendering modal containers
 */
export function useModalRenderer() {
  const modals = useModalStore(state => state.modals);
  const closeModal = useModalStore(state => state.closeModal);
  
  return {
    modals,
    closeModal,
  };
}

/**
 * Type-safe modal hook with specific modal type
 * Provides full type safety for modal props
 */
export function useTypedModal<T extends BaseModalProps>() {
  const { openModal, closeModal, closeAllModals, isModalOpen, updateModal } = useModalStore();
  
  return {
    openModal: (config: ModalConfig<T>) => openModal(config),
    updateModal: (id: string, props: Partial<Omit<T, keyof BaseModalProps>>) => 
      updateModal(id, props),
    closeModal,
    closeAllModals,
    isModalOpen,
  };
}