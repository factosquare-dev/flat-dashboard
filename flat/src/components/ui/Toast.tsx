import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../../store';
import { ToastVariant } from '../../types/enums';
import { cn } from '../../utils/cn';
import './Toast.css';

const variantClassMap = {
  [ToastVariant.DEFAULT]: 'toast--default',
  [ToastVariant.SUCCESS]: 'toast--success',
  [ToastVariant.ERROR]: 'toast--error',
  [ToastVariant.WARNING]: 'toast--warning',
  [ToastVariant.INFO]: 'toast--info',
};

const iconMap = {
  [ToastVariant.DEFAULT]: Info,
  [ToastVariant.SUCCESS]: CheckCircle,
  [ToastVariant.ERROR]: XCircle,
  [ToastVariant.WARNING]: AlertCircle,
  [ToastVariant.INFO]: Info,
};

const iconColorMap = {
  [ToastVariant.DEFAULT]: 'toast__icon--default',
  [ToastVariant.SUCCESS]: 'toast__icon--success',
  [ToastVariant.ERROR]: 'toast__icon--error',
  [ToastVariant.WARNING]: 'toast__icon--warning',
  [ToastVariant.INFO]: 'toast__icon--info',
};

interface ToastProps {
  variant?: ToastVariant;
  id: string;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  variant = ToastVariant.DEFAULT,
  duration = 5000,
  onClose,
}) => {
  const Icon = iconMap[variant || ToastVariant.DEFAULT];
  const iconColorClass = iconColorMap[variant || ToastVariant.DEFAULT];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={cn('toast', variantClassMap[variant])}>
      <div className="toast__content">
        <Icon className={cn('toast__icon', iconColorClass)} />
        <div className="toast__text">
          <p className="toast__title">{title}</p>
          {message && (
            <p className="toast__message">{message}</p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="toast__close"
      >
        <X className="toast__close-icon" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useStore();

  if (notifications.length === 0) return null;

  return (
    <div className="toast-container">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          id={notification.id}
          title={notification.title}
          message={notification.message}
          variant={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};