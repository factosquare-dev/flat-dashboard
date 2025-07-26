import React from 'react';
import { Loader2 } from 'lucide-react';
import { ButtonVariant, Size } from '../../types/enums';
import { cn } from '../../utils/cn';
import './Button.css';

const variantClassMap = {
  [ButtonVariant.PRIMARY]: 'button--primary',
  [ButtonVariant.SECONDARY]: 'button--secondary',
  [ButtonVariant.GHOST]: 'button--ghost',
  [ButtonVariant.DANGER]: 'button--danger',
  [ButtonVariant.SUCCESS]: 'button--success',
  [ButtonVariant.WARNING]: 'button--warning',
};

const sizeClassMap = {
  [Size.SM]: 'button--sm',
  [Size.MD]: 'button--md',
  [Size.LG]: 'button--lg',
  icon: 'button--icon',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: Size | 'icon';
  isLoading?: boolean;
  loading?: boolean; // Alias for isLoading for consistency
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = ButtonVariant.PRIMARY, 
    size = Size.MD, 
    isLoading, 
    loading,
    leftIcon, 
    rightIcon, 
    children, 
    disabled,
    fullWidth,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const isButtonLoading = isLoading || loading;
    const buttonClassName = cn(
      'button',
      variantClassMap[variant],
      size === 'icon' ? sizeClassMap.icon : sizeClassMap[size],
      fullWidth && 'button--full-width',
      className
    );

    return (
      <button
        className={buttonClassName}
        ref={ref}
        disabled={disabled || isButtonLoading}
        data-testid={dataTestId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-disabled={disabled || isButtonLoading}
        {...props}
      >
        {isButtonLoading && (
          <Loader2 className="button__spinner" />
        )}
        {!isButtonLoading && leftIcon && (
          <span className="button__icon button__icon--left">
            {leftIcon}
          </span>
        )}
        {children}
        {!isButtonLoading && rightIcon && (
          <span className="button__icon button__icon--right">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };