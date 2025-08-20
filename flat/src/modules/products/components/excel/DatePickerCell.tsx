import React from 'react';
import { formatDate } from '@/shared/utils/date/formatting';

interface DatePickerCellProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const DatePickerCell: React.FC<DatePickerCellProps> = ({ 
  value, 
  onChange, 
  placeholder = "날짜 선택" 
}) => (
  <div className="relative">
    <input
      type="text"
      value={value ? formatDate(value, 'yy-MM-dd') : ''}
      readOnly
      className="w-full px-1 py-0.5 border-0 bg-transparent text-xs cursor-pointer"
      onClick={(e) => {
        const input = e.currentTarget.nextElementSibling as HTMLInputElement;
        input?.showPicker?.();
      }}
      placeholder={placeholder}
    />
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="absolute inset-0 opacity-0 cursor-pointer"
    />
  </div>
);