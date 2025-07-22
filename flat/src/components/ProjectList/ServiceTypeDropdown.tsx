import React, { useState, useRef, useEffect } from 'react';
import type { ServiceType } from '../../types/project';
import { theme } from '../../config/theme';

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

  const serviceTypes: ServiceType[] = ['OEM', 'ODM', 'OBM', 'Private Label', 'White Label', '기타'];

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
          backgroundColor: theme.colors.primary[100],
          color: theme.colors.primary[700],
          borderColor: theme.colors.primary[300],
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
        <div className="absolute z-50 mt-1 w-auto min-w-[8rem] rounded-lg shadow-lg border overflow-hidden"
          style={{
            backgroundColor: theme.colors.white,
            borderColor: theme.colors.gray[200]
          }}>
          {serviceTypes.map((serviceType) => (
            <button
              key={serviceType}
              onClick={(e) => {
                e.stopPropagation();
                onChange(serviceType);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs font-medium hover:brightness-110 transition-all whitespace-nowrap"
              style={{
                backgroundColor: theme.colors.primary[100],
                color: theme.colors.primary[700],
                borderColor: theme.colors.primary[300]
              }}
            >
              {serviceType}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceTypeDropdown;