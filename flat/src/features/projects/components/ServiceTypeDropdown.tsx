import React, { useState, useRef, useEffect } from 'react';
import type { ServiceType } from '../../../types/project';
import { getServiceTypeDisplayName, getAllServiceTypes } from '../../../utils/serviceTypeUtils';
import '../../../design-system/styles/dropdown.css';

interface ServiceTypeDropdownProps {
  value: ServiceType;
  onChange: (value: ServiceType) => void;
}

const ServiceTypeDropdown: React.FC<ServiceTypeDropdownProps> = ({ value, onChange }) => {
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

  const serviceTypes = getAllServiceTypes();

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="dropdown-trigger bg-indigo-100 text-indigo-700 border-indigo-300"
      >
        {getServiceTypeDisplayName(value)}
        <div className="dropdown-chevron">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="dropdown-menu dropdown-menu-md">
          {serviceTypes.map((serviceTypeInfo) => (
            <button
              key={serviceTypeInfo.code}
              onClick={(e) => {
                e.stopPropagation();
                onChange(serviceTypeInfo.code as ServiceType);
                setIsOpen(false);
              }}
              className="dropdown-item bg-indigo-100 text-indigo-700 border-indigo-300"
              title={serviceTypeInfo.description}
            >
              {serviceTypeInfo.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceTypeDropdown;