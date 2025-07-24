import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ARIA_LABELS, focusManagement, KEYBOARD_KEYS } from '../../utils/accessibility';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  className?: string;
  description?: string;
}

const sizeClasses = {
  sm: 'max-w-[var(--modal-sm)]',
  md: 'max-w-[var(--modal-md)]',
  lg: 'max-w-[var(--modal-lg)]',
  xl: 'max-w-[var(--modal-xl)]'
};

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
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
      document.body.style.overflow = 'hidden';
      
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
        document.body.style.overflow = 'unset';
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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} ${className || ''}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Standardized */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div>
            <h3 id="modal-title" className="text-xl font-semibold text-gray-900">{title}</h3>
            {description && (
              <p id="modal-description" className="mt-2 text-base text-gray-500">{description}</p>
            )}
          </div>
          {showCloseButton && (
            <button 
              onClick={onClose}
              className="ml-4 p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label={ARIA_LABELS.MODAL_CLOSE}
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Modal Content - Standardized scrollable area */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {children}
        </div>

        {/* Modal Footer - Standardized */}
        {footer && (
          <div className="p-6 border-t border-gray-200">
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
  <div className={`flex items-center justify-end gap-3 ${className || ''}`.trim()}>
    {children}
  </div>
);

export default BaseModal;