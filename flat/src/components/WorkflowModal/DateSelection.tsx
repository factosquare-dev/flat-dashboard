import React from 'react';
import { Calendar } from 'lucide-react';
import FormInput from '../common/FormInput';

interface DateSelectionProps {
  startDate: string;
  endDate: string;
  quickAddData?: { factory: string; date: string } | null;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const DateSelection: React.FC<DateSelectionProps> = ({
  startDate,
  endDate,
  quickAddData,
  onStartDateChange,
  onEndDateChange
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        작업 기간
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          type="date"
          label="시작일"
          value={startDate}
          onChange={(e) => {
            onStartDateChange(e.target.value);
            if (quickAddData && !endDate) {
              onEndDateChange(e.target.value);
            }
          }}
        />
        
        <FormInput
          type="date"
          label="종료일"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          min={startDate}
        />
      </div>
    </div>
  );
};