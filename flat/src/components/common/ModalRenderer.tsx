/**
 * Global modal renderer using Zustand store
 * Renders all active modals from the global store
 */

import React from 'react';
import { useModalRenderer } from '../../hooks/common/useModalStore';

export const ModalRenderer: React.FC = () => {
  const { modals, closeModal } = useModalRenderer();
  
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

export default ModalRenderer;