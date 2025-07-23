import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onEnterPress?: () => void;
}

export const FormInput: React.FC<FormInputProps> = ({
  onEnterPress,
  className = '',
  onKeyPress,
  ...props
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onEnterPress) {
        onEnterPress();
      } else {
        (e.target as HTMLInputElement).blur();
      }
    }
    onKeyPress?.(e);
  };

  return (
    <input
      {...props}
      onKeyPress={handleKeyPress}
      className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${className}`}
    />
  );
};