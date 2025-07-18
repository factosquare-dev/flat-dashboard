import React from 'react';
import type { Priority } from '../../types/project';

interface PriorityDropdownProps {
  value: Priority;
  onChange: (value: Priority) => void;
}

const PriorityDropdown: React.FC<PriorityDropdownProps> = ({ value, onChange }) => {
  return (
    <div className="relative inline-block w-full hover-trigger">
      <select
        value={value}
        onChange={(e) => {
          e.stopPropagation();
          onChange(e.target.value as Priority);
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-full px-3 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-sm text-center appearance-none cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
          hover:border-gray-400 hover:shadow-sm"
      >
        <option value="높음">높음</option>
        <option value="보통">보통</option>
        <option value="낮음">낮음</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none opacity-0 hover-show transition-opacity duration-200">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default PriorityDropdown;