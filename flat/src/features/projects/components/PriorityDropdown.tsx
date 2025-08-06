import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Priority } from '@/types/enums';
import { getPriorityDisplayName, getPriorityStyles, getPriorityIcon } from '@/utils/priorityUtils';
import '../../../design-system/styles/dropdown.css';

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

  const priorities: Priority[] = Object.values(Priority);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  }, []);

  const handleSelect = useCallback((priority: Priority, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(priority);
    setIsOpen(false);
  }, [onChange]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={`dropdown-trigger ${getPriorityStyles(value)}`}
      >
        {getPriorityIcon(value)}
        <span className="text-xs font-medium">{getPriorityDisplayName(value)}</span>
        <div className="dropdown-chevron">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="dropdown-menu dropdown-menu-sm">
          {priorities.map((priority) => (
            <button
              key={priority}
              onClick={(e) => handleSelect(priority, e)}
              className={`dropdown-item ${getPriorityStyles(priority)}`}
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