import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const Card: React.FC<CardProps> = ({
  children,
  title,
  description,
  actions,
  footer,
  hoverable = false,
  padding = 'md',
  className = '',
}) => {
  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 shadow-sm
        ${hoverable ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      {(title || description || actions) && (
        <div className={`${padding !== 'none' ? paddingClasses[padding] : 'p-5'} border-b border-gray-200`}>
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              )}
            </div>
            {actions && (
              <div className="ml-4 flex-shrink-0">{actions}</div>
            )}
          </div>
        </div>
      )}
      
      <div className={padding !== 'none' ? paddingClasses[padding] : ''}>
        {children}
      </div>
      
      {footer && (
        <div className={`${padding !== 'none' ? paddingClasses[padding] : 'p-5'} bg-gray-50 border-t border-gray-200 rounded-b-xl`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;