import React from 'react';
import { isToday, isDateInRange, formatDate } from '../../../../utils/unifiedDateUtils';

interface TaskScheduleProps {
  startDate: string;
  endDate: string;
}

const TaskSchedule: React.FC<TaskScheduleProps> = ({ startDate, endDate }) => {
  const formatDateShort = (dateString: string) => {
    try {
      return formatDate(dateString, 'MM/dd');
    } catch {
      return dateString;
    }
  };
  
  // Check if today is within the task schedule
  const isTodayInSchedule = isDateInRange(new Date(), startDate, endDate);

  return (
    <div className={`flex items-center gap-2 text-xs ${
      isTodayInSchedule 
        ? 'bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium' 
        : 'text-gray-600'
    }`}>
      <span className={isToday(startDate) ? 'font-bold' : ''}>
        {formatDateShort(startDate)}
      </span>
      <span className={isTodayInSchedule ? 'text-blue-400' : 'text-gray-300'}>~</span>
      <span className={isToday(endDate) ? 'font-bold' : ''}>
        {formatDateShort(endDate)}
      </span>
    </div>
  );
};

export default TaskSchedule;