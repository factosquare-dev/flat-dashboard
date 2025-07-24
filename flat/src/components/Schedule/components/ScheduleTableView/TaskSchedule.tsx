import React from 'react';

interface TaskScheduleProps {
  startDate: string;
  endDate: string;
}

const TaskSchedule: React.FC<TaskScheduleProps> = ({ startDate, endDate }) => {
  const formatDateShort = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}/${day}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <span>{formatDateShort(startDate)}</span>
      <span className="text-gray-300">~</span>
      <span>{formatDateShort(endDate)}</span>
    </div>
  );
};

export default TaskSchedule;