import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { COMPONENT_STYLES } from '../../styles/components';
import { ARIA_LABELS } from '../../utils/accessibility';

const buttonVariants = cva(
  COMPONENT_STYLES.BUTTON.BASE,
  {
    variants: {
      variant: {
        primary: COMPONENT_STYLES.BUTTON.VARIANT.PRIMARY,
        secondary: COMPONENT_STYLES.BUTTON.VARIANT.SECONDARY,
        outline: COMPONENT_STYLES.BUTTON.VARIANT.OUTLINE,
        ghost: COMPONENT_STYLES.BUTTON.VARIANT.GHOST,
        danger: COMPONENT_STYLES.BUTTON.VARIANT.DANGER,
      },
      size: {
        sm: COMPONENT_STYLES.BUTTON.SIZE.SM,
        md: COMPONENT_STYLES.BUTTON.SIZE.MD,
        lg: COMPONENT_STYLES.BUTTON.SIZE.LG,
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
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
    variant, 
    size, 
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
    const buttonClassName = buttonVariants({ 
      variant, 
      size, 
      className: `${fullWidth ? 'w-full' : ''} ${className || ''}`.trim()
    });

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
          <Loader2 className={`animate-spin ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />
        )}
        {!isButtonLoading && leftIcon && (
          <span className={`flex items-center ${size === 'sm' ? '[&>svg]:w-4 [&>svg]:h-4' : size === 'lg' ? '[&>svg]:w-6 [&>svg]:h-6' : '[&>svg]:w-5 [&>svg]:h-5'}`}>
            {leftIcon}
          </span>
        )}
        {children}
        {!isButtonLoading && rightIcon && (
          <span className={`flex items-center ${size === 'sm' ? '[&>svg]:w-4 [&>svg]:h-4' : size === 'lg' ? '[&>svg]:w-6 [&>svg]:h-6' : '[&>svg]:w-5 [&>svg]:h-5'}`}>
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };