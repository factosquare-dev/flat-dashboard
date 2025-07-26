import React from 'react';
import { Calendar } from 'lucide-react';

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
     <div className="modal-field-spacing">
      <div className="modal-field-label">
        <Calendar />
        작업 기간
      </div>
      <div className="modal-grid-2">
        <div className="modal-field-spacing">
          <label className="modal-field-label">시작일</label>
          <input
            type="date"
            className="modal-input"
            value={startDate}
            onChange={(e) => {
              onStartDateChange(e.target.value);
              if (quickAddData && !endDate) {
                onEndDateChange(e.target.value);
              }
            }}
          />
        </div>
        
        <div className="modal-field-spacing">
          <label className="modal-field-label">종료일</label>
          <input
            type="date"
            className="modal-input"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate}
          />
        </div>
      </div>
    </div>
  );
};