import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ModalFieldProps {
  label: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

/**
 * 가벼운 모달 필드 컴포넌트 - 깊이감 없이 간단한 라벨링
 * Light modal field component - simple labeling without depth
 */
const ModalField: React.FC<ModalFieldProps> = ({
  label,  
  icon: Icon,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-500" />}
        <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
          {label}
        </label>
      </div>
      {children}
    </div>
  );
};

export default ModalField;