import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ModalSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Unified Modal Section Component
 * 모든 모달에서 사용할 통일된 섹션 컴포넌트
 */
const ModalSection: React.FC<ModalSectionProps> = ({
  title,
  icon: Icon,
  iconColor = 'text-blue-600',
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl p-5 border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        {title}
      </h3>
      {children}
    </div>
  );
};

export default ModalSection;