import React, { useState, useRef, useEffect } from 'react';
import type { ProjectStatus } from '../../../types/project';
import { getStatusDisplayName, getStatusStyles, getStatusIcon, getAllStatuses } from '../../../utils/statusUtils';

interface StatusDropdownProps {
  value: ProjectStatus;
  onChange: (value: ProjectStatus) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, onChange }) => {
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

  const statuses = getAllStatuses('project');

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 pr-8 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all
          border ${getStatusStyles(value, 'project')}`}
      >
        {getStatusIcon(value, 'project')}
        {getStatusDisplayName(value, 'project')}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="w-3 h-3 text-current opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {statuses.map((statusInfo) => (
            <button
              key={statusInfo.code}
              onClick={(e) => {
                e.stopPropagation();
                onChange(statusInfo.code as ProjectStatus);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium hover:brightness-110 transition-all
                ${getStatusStyles(statusInfo.code, 'project')}`}
            >
              {getStatusIcon(statusInfo.code, 'project')}
              {statusInfo.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;