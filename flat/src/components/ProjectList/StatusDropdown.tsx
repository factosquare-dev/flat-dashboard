import React, { useState, useRef, useEffect } from 'react';
import type { ProjectStatus } from '../../types/project';
import { theme, statusColors } from '../../config/theme';

interface StatusDropdownProps {
  value: ProjectStatus;
  onChange: (value: ProjectStatus) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getStatusStyle = (status: ProjectStatus): React.CSSProperties => {
    const color = statusColors[status] || theme.colors.gray[500];
    
    // Extract color values (assuming format like var(--color-status-pending))
    const colorValue = color.replace('var(--color-status-', '').replace(')', '');
    
    let bgColor, textColor, borderColor;
    
    switch (colorValue) {
      case 'pending':
        bgColor = theme.colors.gray[100];
        textColor = theme.colors.gray[700];
        borderColor = theme.colors.gray[300];
        break;
      case 'inprogress':
        bgColor = theme.colors.info[100];
        textColor = theme.colors.info[700];
        borderColor = theme.colors.info[300];
        break;
      case 'completed':
        bgColor = theme.colors.success[100];
        textColor = theme.colors.success[700];
        borderColor = theme.colors.success[300];
        break;
      case 'stopped':
        bgColor = theme.colors.danger[100];
        textColor = theme.colors.danger[700];
        borderColor = theme.colors.danger[300];
        break;
      default:
        bgColor = theme.colors.gray[100];
        textColor = theme.colors.gray[700];
        borderColor = theme.colors.gray[300];
    }
    
    return {
      backgroundColor: bgColor,
      color: textColor,
      borderColor: borderColor
    };
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statuses: ProjectStatus[] = ['시작전', '진행중', '완료', '중단'];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="px-3 py-1.5 pr-8 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap
          focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all border"
        style={{
          ...getStatusStyle(value),
          '--tw-ring-color': theme.colors.primary[500]
        } as React.CSSProperties}
      >
        {value}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="w-3 h-3 text-current opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-32 rounded-lg shadow-lg border overflow-hidden"
          style={{
            backgroundColor: theme.colors.white,
            borderColor: theme.colors.gray[200]
          }}>
          {statuses.map((status) => (
            <button
              key={status}
              onClick={(e) => {
                e.stopPropagation();
                onChange(status);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs font-medium hover:brightness-110 transition-all"
              style={getStatusStyle(status)}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;