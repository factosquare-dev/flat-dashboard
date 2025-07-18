import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const alertVariants = cva(
  'relative rounded-lg border p-4',
  {
    variants: {
      variant: {
        default: 'bg-white text-gray-900 border-gray-200',
        info: 'bg-blue-50 text-blue-900 border-blue-200',
        success: 'bg-green-50 text-green-900 border-green-200',
        warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
        error: 'bg-red-50 text-red-900 border-red-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconMap = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = 'default', 
    title, 
    description, 
    icon,
    dismissible,
    onDismiss,
    children,
    ...props 
  }, ref) => {
    const Icon = iconMap[variant || 'default'];
    const showIcon = icon !== false;

    return (
      <div
        ref={ref}
        role="alert"
        className={alertVariants({ variant, className })}
        {...props}
      >
        <div className="flex">
          {showIcon && (
            <div className="flex-shrink-0">
              {icon || <Icon className="h-5 w-5" />}
            </div>
          )}
          <div className={`${showIcon ? 'ml-3' : ''} flex-1`}>
            {title && (
              <h3 className="text-sm font-medium mb-1">{title}</h3>
            )}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
            {children}
          </div>
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-auto -mx-1.5 -my-1.5 inline-flex h-8 w-8 rounded-lg p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert, alertVariants };