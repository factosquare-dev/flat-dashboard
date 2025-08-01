import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ProjectStatus } from '../../../types/project';
import { getStatusDisplayName, getStatusStyles, getStatusIcon, getAllStatuses } from '@/utils/statusUtils';
import '../../../design-system/styles/dropdown.css';

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

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  }, []);

  const handleSelect = useCallback((status: ProjectStatus) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(status);
    setIsOpen(false);
  }, [onChange]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={`dropdown-trigger ${getStatusStyles(value, 'project')}`}
      >
        {getStatusIcon(value, 'project')}
        {getStatusDisplayName(value, 'project')}
        <div className="dropdown-chevron">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="dropdown-menu dropdown-menu-md">
          {statuses.map((statusInfo) => (
            <button
              key={statusInfo.code}
              onClick={handleSelect(statusInfo.code as ProjectStatus)}
              className={`dropdown-item ${getStatusStyles(statusInfo.code, 'project')}`}
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