import React, { useState, useRef, useEffect } from 'react';
import type { Priority } from '../../types/project';
import { theme, priorityColors } from '../../config/theme';

interface PriorityDropdownProps {
  value: Priority;
  onChange: (value: Priority) => void;
}

const PriorityDropdown: React.FC<PriorityDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case '높음':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case '보통':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case '낮음':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getPriorityStyle = (priority: Priority): React.CSSProperties => {
    let bgColor, textColor, borderColor;
    
    switch (priority) {
      case '높음':
        bgColor = theme.colors.danger[100];
        textColor = theme.colors.danger[700];
        borderColor = theme.colors.danger[300];
        break;
      case '보통':
        bgColor = theme.colors.warning[100];
        textColor = theme.colors.warning[700];
        borderColor = theme.colors.warning[300];
        break;
      case '낮음':
        bgColor = theme.colors.success[100];
        textColor = theme.colors.success[700];
        borderColor = theme.colors.success[300];
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

  const priorities: Priority[] = ['높음', '보통', '낮음'];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          transition-all cursor-pointer"
        style={getPriorityStyle(value)}
      >
        {getPriorityIcon(value)}
        <span className="text-xs font-medium">{value}</span>
        <svg className="w-3 h-3 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-24 rounded-lg shadow-lg border overflow-hidden"
          style={{
            backgroundColor: theme.colors.white,
            borderColor: theme.colors.gray[200]
          }}>
          {priorities.map((priority) => (
            <button
              key={priority}
              onClick={(e) => {
                e.stopPropagation();
                onChange(priority);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs font-medium hover:brightness-110 transition-all
                flex items-center gap-2"
              style={getPriorityStyle(priority)}
            >
              {getPriorityIcon(priority)}
              {priority}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriorityDropdown;