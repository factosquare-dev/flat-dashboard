import React, { useMemo } from 'react';
import { isToday, isWeekend } from '../../utils/coreUtils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '../../utils/cn';
import './TimelineHeader.css';

interface TimelineHeaderProps {
  days: Date[];
  cellWidth: number;
}

const TimelineHeaderComponent: React.FC<TimelineHeaderProps> = ({ days, cellWidth }) => {
  // Group days by month for month headers - memoized to avoid recalculation
  const monthGroups = useMemo(() => {
    return days.reduce((acc, day, index) => {
      const monthKey = format(day, 'yyyy-MM');
      if (!acc[monthKey]) {
        acc[monthKey] = { start: index, count: 0, month: day };
      }
      acc[monthKey].count++;
      return acc;
    }, {} as Record<string, { start: number; count: number; month: Date }>);
  }, [days]);

  return (
    <>
      {/* Month row */}
      <div className="timeline-header__month-row">
        <div className="flex">
          {Object.values(monthGroups).map((group, index) => (
            <div
              key={index}
              className="timeline-header__month-cell"
              style={{ 
                width: `${group.count * cellWidth}px`
              }}
            >
              {format(group.month, 'yyyy.MMM', { locale: ko })}
            </div>
          ))}
        </div>
      </div>

      {/* Date row */}
      <div className="timeline-header__date-row">
        <div className="flex">
          {days.map((day, index) => {
            return (
              <div
                key={index}
                className={cn(
                  'timeline-header__date-cell',
                  isWeekend(day) && 'timeline-header__date-cell--weekend'
                )}
                style={{ 
                  width: `${cellWidth}px`
                }}
              >
                <div className="timeline-header__date-content">
                  <div className={cn(
                    'timeline-header__day-text',
                    isToday(day) && 'timeline-header__day-text--today'
                  )}>
                    {format(day, 'EEE', { locale: ko })}
                  </div>
                  <div className={cn(
                    'timeline-header__date-number',
                    isToday(day) && 'timeline-header__date-number--today'
                  )}>
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

const TimelineHeader = React.memo(TimelineHeaderComponent);

export default TimelineHeader;