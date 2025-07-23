import React, { useEffect } from 'react';
import { X } from 'lucide-react';

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
  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscKey);
        document.body.style.overflow = 'unset';
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
    >
      <div 
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} ${className || ''}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Standardized */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="mt-2 text-base text-gray-500">{description}</p>
            )}
          </div>
          {showCloseButton && (
            <button 
              onClick={onClose}
              className="ml-4 p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
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