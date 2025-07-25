/**
 * Confirmation modal component
 */

import React, { useMemo } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm?: () => void | Promise<void>;
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  onConfirm,
  loading = false,
}) => {
  const [isConfirming, setIsConfirming] = React.useState(false);

  const variantStyles = useMemo(() => {
    const variants = {
      danger: {
        icon: '⚠️',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      },
      warning: {
        icon: '⚠️',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      },
      info: {
        icon: 'ℹ️',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      },
    };
    
    return variants[variant];
  }, [variant]);

  const handleConfirm = React.useCallback(async () => {
    if (!onConfirm) {
      onClose();
      return;
    }

    setIsConfirming(true);
    
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsConfirming(false);
    }
  }, [onConfirm, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-start">
          <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${variantStyles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
            <span className={`text-xl ${variantStyles.iconColor}`} role="img">
              {variantStyles.icon}
            </span>
          </div>
          
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg font-medium text-gray-900">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming || loading}
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${variantStyles.confirmBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {(isConfirming || loading) && (
              <svg
                className="w-4 h-4 mr-2 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {confirmText}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming || loading}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ConfirmationModal);