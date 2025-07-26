import React, { useEffect, useRef, createContext, useContext } from 'react';
import { X } from 'lucide-react';
import { ARIA_LABELS, focusManagement, KEYBOARD_KEYS } from '../../../utils/accessibility';
import { ModalSize } from '../../../types/enums';
import './CompoundModal.css';

// Modal Context
interface ModalContextValue {
  isOpen: boolean;
  onClose: () => void;
  size: ModalSize;
}

const ModalContext = createContext<ModalContextValue | null>(null);

const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal compound components must be used within Modal');
  }
  return context;
};

// Root Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  children: React.ReactNode;
  className?: string;
}

const ModalRoot: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  size = ModalSize.MD,
  children,
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

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

  const sizeClass = {
    [ModalSize.SM]: 'modal-container--sm',
    [ModalSize.MD]: 'modal-container--md',
    [ModalSize.LG]: 'modal-container--lg',
    [ModalSize.XL]: 'modal-container--xl'
  }[size];

  return (
    <ModalContext.Provider value={{ isOpen, onClose, size }}>
      <div 
        className="modal-backdrop"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
      >
        <div 
          ref={modalRef}
          className={`modal-container ${sizeClass} ${className}`.trim()}
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
  showCloseButton?: boolean;
  className?: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ 
  children, 
  showCloseButton = true,
  className = '' 
}) => {
  const { onClose } = useModalContext();

  return (
    <div className={`modal-header ${className}`.trim()}>
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

const ModalTitle: React.FC<ModalTitleProps> = ({ children, className = '' }) => (
  <h3 id="modal-title" className={`modal-header__title ${className}`.trim()}>
    {children}
  </h3>
);

// Modal Description Component
interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const ModalDescription: React.FC<ModalDescriptionProps> = ({ children, className = '' }) => (
  <p id="modal-description" className={`modal-header__description ${className}`.trim()}>
    {children}
  </p>
);

// Modal Body Component
interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

const ModalBody: React.FC<ModalBodyProps> = ({ children, className = '' }) => (
  <div className={`modal-content ${className}`.trim()}>
    {children}
  </div>
);

// Modal Footer Component
interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ children, className = '' }) => (
  <div className={`modal-footer ${className}`.trim()}>
    <div className="modal-footer__actions">
      {children}
    </div>
  </div>
);

// Export compound components
export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Title: ModalTitle,
  Description: ModalDescription,
  Body: ModalBody,
  Footer: ModalFooter
});

// For backward compatibility
export default Modal;