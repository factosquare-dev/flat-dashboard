import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ValidationMessageProps {
  type: 'error' | 'success' | 'info';
  message: string;
  className?: string;
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({ type, message, className = '' }) => {
  const config = {
    error: {
      className: 'modal-validation-message--error',
      icon: AlertCircle,
      iconClass: 'text-red-600'
    },
    success: {
      className: 'modal-validation-message--success',
      icon: CheckCircle,
      iconClass: 'text-green-600'
    },
    info: {
      className: 'modal-validation-message--info',
      icon: Info,
      iconClass: 'text-blue-600'
    }
  };

  const { className: typeClass, icon: Icon, iconClass } = config[type];

  return (
    <div className={`modal-validation-message ${typeClass} ${className}`} role="alert">
      <Icon className={`modal-validation-message__icon ${iconClass}`} />
      <span>{message}</span>
    </div>
  );
};

export default ValidationMessage;