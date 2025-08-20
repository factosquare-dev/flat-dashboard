/**
 * Confirmation modal component
 */

import React, { useMemo } from 'react';
import { logError } from '@/utils/error';
import { ModalVariant, ModalSize, ButtonVariant, ButtonSize } from '@/types/enums';
import BaseModal, { ModalFooter } from '@/common/BaseModal';
import { Button } from '@/ui/Button';
import { cn } from '@/utils/cn';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
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
  variant = ModalVariant.INFO,
  onConfirm,
  loading = false,
}) => {
  const [isConfirming, setIsConfirming] = React.useState(false);

  const variantStyles = useMemo(() => {
    const variants = {
      [ModalVariant.DANGER]: {
        icon: '⚠️',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      },
      [ModalVariant.WARNING]: {
        icon: '⚠️',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      },
      [ModalVariant.INFO]: {
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
      logError('ConfirmationModal', error);
    } finally {
      setIsConfirming(false);
    }
  }, [onConfirm, onClose]);

  const footer = (
    <ModalFooter>
      <Button
        variant={ButtonVariant.SECONDARY}
        size={ButtonSize.MD}
        onClick={onClose}
        disabled={isConfirming || loading}
      >
        {cancelText}
      </Button>
      <Button
        variant={variant === ModalVariant.DANGER ? ButtonVariant.DANGER : ButtonVariant.PRIMARY}
        size={ButtonSize.MD}
        onClick={handleConfirm}
        disabled={isConfirming || loading}
        loading={isConfirming || loading}
      >
        {confirmText}
      </Button>
    </ModalFooter>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size={ModalSize.SM}
      showCloseButton={false}
      footer={footer}
    >
      <div className="modal-section-spacing">
        <div className="confirmation-modal__content">
          <div className={cn(
            'confirmation-modal__icon-container',
            variant === ModalVariant.DANGER && 'confirmation-modal__icon-container--danger',
            variant === ModalVariant.WARNING && 'confirmation-modal__icon-container--warning',
            variant === ModalVariant.INFO && 'confirmation-modal__icon-container--info'
          )}>
            <span className="confirmation-modal__icon" role="img">
              {variantStyles.icon}
            </span>
          </div>
          
          <div className="modal-field-spacing">
            <h3 className="confirmation-modal__title">
              {title}
            </h3>
            <div className="confirmation-modal__message">
              {message}
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default React.memo(ConfirmationModal);