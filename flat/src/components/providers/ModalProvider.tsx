/**
 * Modal Provider Component
 * Renders modals from Zustand store
 */

import React from 'react';
import { useModalStore } from '../../stores/modalStore';

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const modals = useModalStore((state) => state.modals);
  const closeModal = useModalStore((state) => state.closeModal);

  return (
    <>
      {children}
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