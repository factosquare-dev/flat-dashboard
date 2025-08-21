import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ARIA_LABELS, focusManagement, KEYBOARD_KEYS } from '@/shared/utils/accessibility';
import { ModalSize } from '@/shared/types/enums';
import './BaseModal.css';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  className?: string;
  description?: string;
}

const sizeClassMap = {
  [ModalSize.SM]: 'modal-container--sm',
  [ModalSize.MD]: 'modal-container--md',
  [ModalSize.LG]: 'modal-container--lg',
  [ModalSize.XL]: 'modal-container--xl',
  [ModalSize.FULL]: 'modal-container--full',
  [ModalSize.AUTO]: 'modal-container--auto'
};

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = ModalSize.SM,
  showCloseButton = true,
  footer,
  className = '',
  description
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Focus management and ESC key handler
  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      
      // Focus first element in modal
      setTimeout(() => {
        if (modalRef.current) {
          focusManagement.focusFirst(modalRef.current);
        }
      }, 0);

      // Prevent body scroll
      document.body.classList.add('modal-open');
      
      // Trap focus and handle ESC
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
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div 
        ref={modalRef}
        className={`modal-container ${sizeClassMap[size]} ${className || ''}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Standardized */}
        <div className="modal-header">
          <div className="modal-header__content">
            <h3 id="modal-title" className="modal-header__title">{title}</h3>
            {description && (
              <p id="modal-description" className="modal-header__description">{description}</p>
            )}
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

        {/* Modal Content - Standardized scrollable area */}
        <div className="modal-content">
          {children}
        </div>

        {/* Modal Footer - Standardized */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Standard Modal Footer Component
export const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`modal-footer__actions ${className || ''}`.trim()}>
    {children}
  </div>
);

export default BaseModal;