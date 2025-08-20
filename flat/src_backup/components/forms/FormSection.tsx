import React from 'react';
import type { FormSectionProps } from './types';

export const FormSection = <T,>({
  title,
  icon: Icon,
  iconColor = 'text-blue-600',
  children,
  className = ''
}: FormSectionProps<T>) => {
  return (
    <div className={`bg-white rounded-xl p-5 border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
        {title}
      </h3>
      {children}
    </div>
  );
};