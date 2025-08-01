/**
 * Modal Compound Components
 * 
 * A flexible modal system using the compound components pattern
 * Provides better composition and customization capabilities
 */

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ARIA_LABELS, focusManagement, KEYBOARD_KEYS } from '../../../utils/accessibility';
import { ModalSize } from '../../../types/enums';
import { cn } from '../../../utils/cn';
import './Modal.css';

// Modal Context for sharing state between compound components
interface ModalContextValue {
  isOpen: boolean;
  onClose: () => void;
  modalId: string;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal compound components must be used within Modal.Root');
  }
  return context;
};

// Root Modal Component
interface ModalRootProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const ModalRoot: React.FC<ModalRootProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  className 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const modalId = useRef(`modal-${Math.random().toString(36).substr(2, 9)}`).current;

  // Focus management and ESC key handler
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      
      setTimeout(() => {
        if (modalRef.current) {
          focusManagement.focusFirst(modalRef.current);
        }
      }, 0);

      document.body.classList.add('modal-open');
      
      const cleanup = modalRef.current ? focusManagement.trapFocus(modalRef.current) : undefined;
      
      const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === KEYBOARD_KEYS.ESCAPE) {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      return () => {
        cleanup?.();
        document.removeEventListener('keydown', handleEscKey);
        document.body.classList.remove('modal-open');
        focusManagement.restoreFocus(previouslyFocusedRef.current);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalContext.Provider value={{ isOpen, onClose, modalId }}>
      <div 
        className="modal-backdrop"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${modalId}-title`}
        aria-describedby={`${modalId}-description`}
      >
        <div 
          ref={modalRef}
          className={cn('modal-container', className)}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
};

// Modal Header Component
interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ 
  children, 
  className,
  showCloseButton = true
}) => {
  const { onClose } = useModalContext();
  
  return (
    <div className={cn('modal-header', className)}>
      <div className="modal-header__content">
        {children}
      </div>
      {showCloseButton && (
        <button 
          onClick={onClose}
          className="modal-close-button"
          aria-label={ARIA_LABELS.MODAL_CLOSE}
        >
          <X className="modal-close-button__icon" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

// Modal Title Component
interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

const ModalTitle: React.FC<ModalTitleProps> = ({ children, className }) => {
  const { modalId } = useModalContext();
  
  return (
    <h3 
      id={`${modalId}-title`}
      className={cn('modal-header__title', className)}
    >
      {children}
    </h3>
  );
};

// Modal Description Component
interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const ModalDescription: React.FC<ModalDescriptionProps> = ({ children, className }) => {
  const { modalId } = useModalContext();
  
  return (
    <p 
      id={`${modalId}-description`}
      className={cn('modal-header__description', className)}
    >
      {children}
    </p>
  );
};

// Modal Body Component
interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

const ModalBody: React.FC<ModalBodyProps> = ({ children, className }) => {
  return (
    <div className={cn('modal-content', className)}>
      {children}
    </div>
  );
};

// Modal Footer Component
interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'space-between';
}

const ModalFooter: React.FC<ModalFooterProps> = ({ 
  children, 
  className,
  align = 'right'
}) => {
  return (
    <div className={cn('modal-footer', `modal-footer--${align}`, className)}>
      <div className="modal-footer__actions">
        {children}
      </div>
    </div>
  );
};

// Modal Size Variants (HOC)
interface ModalWithSizeProps extends ModalRootProps {
  size?: ModalSize;
}

const ModalWithSize: React.FC<ModalWithSizeProps> = ({ 
  size = ModalSize.MD, 
  className,
  ...props 
}) => {
  const sizeClassMap = {
    [ModalSize.SM]: 'modal-container--sm',
    [ModalSize.MD]: 'modal-container--md',
    [ModalSize.LG]: 'modal-container--lg',
    [ModalSize.XL]: 'modal-container--xl'
  };
  
  return (
    <ModalRoot 
      className={cn(sizeClassMap[size], className)} 
      {...props} 
    />
  );
};

// Export compound components
export const Modal = {
  Root: ModalWithSize,
  Header: ModalHeader,
  Title: ModalTitle,
  Description: ModalDescription,
  Body: ModalBody,
  Footer: ModalFooter,
};

// Usage Example:
// <Modal.Root isOpen={isOpen} onClose={onClose} size={ModalSize.LG}>
//   <Modal.Header>
//     <Modal.Title>Project Details</Modal.Title>
//     <Modal.Description>Edit project information below</Modal.Description>
//   </Modal.Header>
//   <Modal.Body>
//     {/* Your content here */}
//   </Modal.Body>
//   <Modal.Footer>
//     <Button variant="secondary" onClick={onClose}>Cancel</Button>
//     <Button variant="primary" onClick={onSave}>Save</Button>
//   </Modal.Footer>
// </Modal.Root>