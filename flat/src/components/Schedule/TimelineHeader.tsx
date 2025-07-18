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
      <div className="flex border-b border-gray-300 bg-gray-50">
        <div className="w-64 px-4 py-2 font-semibold text-gray-700 bg-gray-100 border-r border-gray-300">
          프로젝트
        </div>
        <div className="flex">
          {Object.values(monthGroups).map((group, index) => (
            <div
              key={index}
              className="text-center font-semibold text-gray-700 border-r border-gray-200 bg-gray-50"
              style={{ width: `${group.count * cellWidth}px` }}
            >
              {group.month.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
            </div>
          ))}
        </div>
      </div>

      {/* Date row */}
      <div className="flex border-b border-gray-300">
        <div className="w-64 px-4 py-2 bg-gray-100 border-r border-gray-300"></div>
        <div className="flex">
          {days.map((day, index) => (
            <div
              key={index}
              className={`text-center text-xs border-r border-gray-200 py-2 ${
                isToday(day) ? 'bg-blue-100 font-bold' : 
                isWeekend(day) ? 'bg-gray-100' : 'bg-white'
              }`}
              style={{ width: `${cellWidth}px` }}
            >
              <div>{formatDate(day)}</div>
              <div className="text-gray-500">
                {day.toLocaleDateString('ko-KR', { weekday: 'short' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TimelineHeader;