import React, { useMemo, useCallback } from 'react';
import { GANTT_CONSTANTS, TOTAL_DAYS } from '@/constants/gantt';
import { getTodayIndex, isTodayInRange } from '@/utils/ganttUtils';
import { cn } from '@/utils/cn';
import './GanttHeader.css';

interface GanttHeaderProps {
  headerRef: React.RefObject<HTMLDivElement>;
  onHeaderScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

const GanttHeader: React.FC<GanttHeaderProps> = ({ headerRef, onHeaderScroll }) => {
  const todayIndex = getTodayIndex();
  const isToday = isTodayInRange();

  // Render month headers - extracted for better readability
  const renderMonthHeaders = useCallback(() => {
    const months: JSX.Element[] = [];
    let currentMonth = -1;
    let monthStart = 0;
    let monthDays = 0;
    
    for (let i = 0; i < TOTAL_DAYS; i++) {
      const date = new Date(GANTT_CONSTANTS.BASE_DATE);
      date.setDate(date.getDate() + i);
      const month = date.getMonth();
      
      if (month !== currentMonth) {
        if (currentMonth !== -1) {
          months.push(
            <div
              key={`month-${currentMonth}`}
              className="gantt-header__month"
              style={{ 
                '--month-start': monthStart,
                '--month-days': monthDays
              } as React.CSSProperties}
            >
              {new Date(2025, currentMonth).toLocaleString('ko-KR', { month: 'long' })}
            </div>
          );
        }
        currentMonth = month;
        monthStart = i;
        monthDays = 0;
      }
      monthDays++;
    }
    
    // Add last month
    if (monthDays > 0) {
      months.push(
        <div
          key={`month-${currentMonth}`}
          className="border-r border-gray-300 flex items-center justify-center text-sm font-medium"
          style={{ 
            position: 'absolute',
            left: monthStart * GANTT_CONSTANTS.CELL_WIDTH,
            width: monthDays * GANTT_CONSTANTS.CELL_WIDTH
          }}
        >
          {new Date(2025, currentMonth).toLocaleString('ko-KR', { month: 'long' })}
        </div>
      );
    }
    
    return months;
  }, []);

  // Render date headers with memoization for performance
  const dateHeaders = useMemo(() => {
    const headers = [];
    for (let i = 0; i < TOTAL_DAYS; i++) {
      const date = new Date(GANTT_CONSTANTS.BASE_DATE);
      date.setDate(date.getDate() + i);
      const day = date.getDate();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isTodayColumn = i === todayIndex;
      
      headers.push(
        <div
          key={i}
          className={`flex items-center justify-center text-xs border-r border-gray-200 ${
            isWeekend ? 'bg-gray-100' : ''
          } ${isTodayColumn ? 'bg-red-100 font-bold text-red-600' : ''}`}
          style={{ 
            width: GANTT_CONSTANTS.CELL_WIDTH, 
            height: GANTT_CONSTANTS.HEADER_HEIGHT - 32 
          }}
        >
          {day}
        </div>
      );
    }
    return headers;
  }, [todayIndex]);

  return (
    <div className="gantt-header"
      style={{
        '--gantt-cell-width': `${GANTT_CONSTANTS.CELL_WIDTH}px`,
        '--gantt-header-height': `${GANTT_CONSTANTS.HEADER_HEIGHT}px`,
        '--gantt-total-days': TOTAL_DAYS,
        '--today-index': todayIndex
      } as React.CSSProperties}
    >
      {/* Project column header */}
      <div className="gantt-header__project-column">
        <h3 className="gantt-header__title">프로젝트 / 작업</h3>
      </div>
      
      {/* Date headers */}
      <div 
        ref={headerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-none"
        onScroll={onHeaderScroll}
        style={{ height: GANTT_CONSTANTS.HEADER_HEIGHT }}
      >
        <div 
          className="relative" 
          style={{ 
            width: TOTAL_DAYS * GANTT_CONSTANTS.CELL_WIDTH, 
            height: GANTT_CONSTANTS.HEADER_HEIGHT 
          }}
        >
          {/* Month row */}
          <div className="absolute top-0 left-0 right-0 h-8 flex border-b border-gray-200">
            {renderMonthHeaders()}
          </div>
          
          {/* Date row */}
          <div className="absolute top-8 left-0 right-0 flex">
            {dateHeaders}
          </div>
          
          {/* Today line in header */}
          {isToday && (
            <div
              className="absolute top-0 w-0.5 bg-red-500 z-20"
              style={{ 
                left: todayIndex * GANTT_CONSTANTS.CELL_WIDTH + GANTT_CONSTANTS.CELL_WIDTH / 2,
                height: GANTT_CONSTANTS.HEADER_HEIGHT
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GanttHeader;