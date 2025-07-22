import React, { useState, useRef, useEffect } from 'react';
import type { ProjectStatus } from '../../types/project';

interface StatusDropdownProps {
  value: ProjectStatus;
  onChange: (value: ProjectStatus) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getStatusStyle = (status: ProjectStatus) => {
    switch (status) {
      case '시작전':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case '진행중':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case '완료':
        return 'bg-green-100 text-green-700 border-green-300';
      case '중단':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
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
        className={`px-3 py-1.5 pr-8 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all
          border ${getStatusStyle(value)}`}
      >
        {value}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="w-3 h-3 text-current opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={(e) => {
                e.stopPropagation();
                onChange(status);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs font-medium hover:brightness-110 transition-all
                ${getStatusStyle(status)}`}
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