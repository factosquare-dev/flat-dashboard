import React from 'react';
import { formatDate, isToday, isWeekend, getWeekNumber } from '../../utils/dateUtils';

interface TimelineHeaderProps {
  days: Date[];
  cellWidth: number;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({ days, cellWidth }) => {
  // Group days by month for month headers
  const monthGroups = days.reduce((acc, day, index) => {
    const monthKey = `${day.getFullYear()}-${day.getMonth()}`;
    if (!acc[monthKey]) {
      acc[monthKey] = { start: index, count: 0, month: day };
    }
    acc[monthKey].count++;
    return acc;
  }, {} as Record<string, { start: number; count: number; month: Date }>);

  return (
    <>
      {/* Month row */}
      <div className="flex border-b border-gray-200 bg-white" style={{ height: '24px' }}>
        <div className="flex">
          {Object.values(monthGroups).map((group, index) => (
            <div
              key={index}
              className="text-center text-[10px] font-medium text-gray-600 border-r border-gray-100 flex items-center justify-center px-1"
              style={{ 
                width: `${group.count * cellWidth}px`, 
                height: '24px',
                minWidth: '60px' // Ensure month name doesn't get cut off
              }}
            >
              {group.month.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }).replace(' ', '.')}
            </div>
          ))}
        </div>
      </div>

      {/* Date row */}
      <div className="flex border-b border-gray-200" style={{ height: '28px' }}>
        <div className="flex">
          {days.map((day, index) => {
            const isFirstOfMonth = day.getDate() === 1;
            return (
              <div
                key={index}
                className={`text-center text-[10px] flex items-center justify-center border-r border-gray-100 transition-colors relative ${
                  isWeekend(day) ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                style={{ 
                  width: `${cellWidth}px`, 
                  height: '28px'
                  // Removed padding to maintain alignment with grid cells
                }}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <div className={`text-[9px] leading-tight ${isToday(day) ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                    {day.toLocaleDateString('ko-KR', { weekday: 'short' })}
                  </div>
                  <div className={`font-medium flex items-center justify-center ${
                    isToday(day) 
                      ? 'bg-blue-500 text-white w-5 h-5 rounded-full text-xs' 
                      : 'text-sm text-gray-700'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default TimelineHeader;