import React from 'react';
import type { ServiceType } from '../../types/project';

interface ServiceTypeDropdownProps {
  value: ServiceType;
  onChange: (value: ServiceType) => void;
}

const ServiceTypeDropdown: React.FC<ServiceTypeDropdownProps> = ({ value, onChange }) => {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => {
          e.stopPropagation();
          onChange(e.target.value as ServiceType);
        }}
        onClick={(e) => e.stopPropagation()}
        className="px-3 py-1.5 pr-8 rounded-full text-xs font-medium appearance-none cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all
          border bg-indigo-100 text-indigo-700 border-indigo-300"
      >
        <option value="OEM">OEM</option>
        <option value="ODM">ODM</option>
        <option value="OBM">OBM</option>
        <option value="Private Label">Private Label</option>
        <option value="White Label">White Label</option>
        <option value="기타">기타</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="w-3 h-3 text-current opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default ServiceTypeDropdown;