import React from 'react';
import { ButtonVariant, ButtonSize } from '../../types/enums';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Unified Button Component
 * 
 * Follows SOLID-FLAT principles:
 * - Single Responsibility: Only renders buttons with consistent styling
 * - Open/Closed: Extensible via variants and props
 * - Dependency Inversion: Uses ButtonVariant and ButtonSize enums
 */
const Button: React.FC<ButtonProps> = ({
  variant = ButtonVariant.PRIMARY,
  size = ButtonSize.MD,
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const getVariantClass = (buttonVariant: ButtonVariant): string => {
    switch (buttonVariant) {
      case ButtonVariant.PRIMARY:
        return 'button--primary';
      case ButtonVariant.SECONDARY:
        return 'button--secondary';
      case ButtonVariant.DANGER:
        return 'button--danger';
      case ButtonVariant.GHOST:
        return 'button--ghost';
      case ButtonVariant.SUCCESS:
        return 'button--success';
      case ButtonVariant.WARNING:
        return 'button--warning';
      default:
        return 'button--primary';
    }
  };

  const getSizeClass = (buttonSize: ButtonSize): string => {
    switch (buttonSize) {
      case ButtonSize.SM:
        return 'button--sm';
      case ButtonSize.MD:
        return 'button--md';
      case ButtonSize.LG:
        return 'button--lg';
      default:
        return 'button--md';
    }
  };

  const baseClasses = [
    'button',
    getVariantClass(variant),
    getSizeClass(size),
    loading && 'button--loading',
    disabled && 'button--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="button__spinner" />}
      {icon && <span className="button__icon">{icon}</span>}
      <span className="button__text">{children}</span>
    </button>
  );
};

export default Button;