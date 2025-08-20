import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { ValidationMessageType } from '@/shared/types/enums';

interface ValidationMessageProps {
  type: ValidationMessageType;
  message: string;
  className?: string;
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({ type, message, className = '' }) => {
  const config = {
    [ValidationMessageType.ERROR]: {
      className: 'modal-validation-message--error',
      icon: AlertCircle,
      iconClass: 'text-red-600'
    },
    [ValidationMessageType.SUCCESS]: {
      className: 'modal-validation-message--success',
      icon: CheckCircle,
      iconClass: 'text-green-600'
    },
    [ValidationMessageType.INFO]: {
      className: 'modal-validation-message--info',
      icon: Info,
      iconClass: 'text-blue-600'
    },
    [ValidationMessageType.WARNING]: {
      className: 'modal-validation-message--warning',
      icon: AlertCircle,
      iconClass: 'text-yellow-600'
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