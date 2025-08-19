/**
 * Modal Store using Zustand
 * Replaces ModalContext with more performant state management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { BaseModalProps } from '@/contexts/ModalContext';

// Reuse types from ModalContext for compatibility
export interface ModalConfig<T extends BaseModalProps = BaseModalProps> {
  id: string;
  component: React.ComponentType<T>;
  props?: Omit<T, keyof BaseModalProps>;
}

export type ModalConfigAny = ModalConfig<BaseModalProps>;

interface ModalState {
  modals: ModalConfigAny[];
  openModal: <T extends BaseModalProps>(config: ModalConfig<T>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  isModalOpen: (id: string) => boolean;
  updateModal: <T extends BaseModalProps>(id: string, props: Partial<Omit<T, keyof BaseModalProps>>) => void;
}

export const useModalStore = create<ModalState>()(
  devtools(
    (set, get) => ({
      modals: [],

      openModal: <T extends BaseModalProps>(config: ModalConfig<T>) => {
        set((state) => {
          // Prevent duplicate modals
          const exists = state.modals.some(modal => modal.id === config.id);
          if (exists) {
            return {
              modals: state.modals.map(modal =>
                modal.id === config.id ? { ...modal, ...config } : modal
              )
            };
          }
          return { modals: [...state.modals, config as ModalConfigAny] };
        });
      },

      closeModal: (id: string) => {
        set((state) => ({
          modals: state.modals.filter(modal => modal.id !== id)
        }));
      },

      closeAllModals: () => {
        set({ modals: [] });
      },

      isModalOpen: (id: string) => {
        return get().modals.some(modal => modal.id === id);
      },

      updateModal: <T extends BaseModalProps>(
        id: string,
        props: Partial<Omit<T, keyof BaseModalProps>>
      ) => {
        set((state) => ({
          modals: state.modals.map(modal =>
            modal.id === id
              ? { ...modal, props: { ...modal.props, ...props } }
              : modal
          )
        }));
      }
    }),
    {
      name: 'modal-store', // name of the item in devtools
    }
  )
);

// Type-safe modal hook with specific modal type
export function useTypedModal<T extends BaseModalProps>() {
  const { openModal, updateModal, closeModal, closeAllModals, isModalOpen } = useModalStore();
  
  return {
    openModal: (config: ModalConfig<T>) => openModal(config),
    updateModal: (id: string, props: Partial<Omit<T, keyof BaseModalProps>>) => 
      updateModal(id, props),
    closeModal,
    closeAllModals,
    isModalOpen
  };
}