import React, { useState, useRef, useEffect } from 'react';
import type { Priority } from '../../../types/project';
import { PROJECT_PRIORITY_OPTIONS } from '../../../constants';
import { getPriorityDisplayName, getPriorityStyles, getPriorityIcon } from '../../../utils/priorityUtils';

interface PriorityDropdownProps {
  value: Priority;
  onChange: (value: Priority) => void;
}

const PriorityDropdown: React.FC<PriorityDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const priorities: Priority[] = PROJECT_PRIORITY_OPTIONS as Priority[];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          transition-all cursor-pointer ${getPriorityStyles(value)}`}
      >
        {getPriorityIcon(value)}
        <span className="text-xs font-medium">{getPriorityDisplayName(value)}</span>
        <svg className="w-3 h-3 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-24 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {priorities.map((priority) => (
            <button
              key={priority}
              onClick={(e) => {
                e.stopPropagation();
                onChange(priority);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs font-medium hover:brightness-110 transition-all
                flex items-center gap-2 ${getPriorityStyles(priority)}`}
            >
              {getPriorityIcon(priority)}
              {getPriorityDisplayName(priority)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriorityDropdown;