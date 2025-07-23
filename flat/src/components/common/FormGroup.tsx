import React from 'react';

interface FormGroupProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const FormGroup: React.FC<FormGroupProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`space-y-4 ${className || ''}`.trim()}>
      <h3 className="text-base font-medium text-gray-900 pb-2 border-b border-gray-200">
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormGroup;