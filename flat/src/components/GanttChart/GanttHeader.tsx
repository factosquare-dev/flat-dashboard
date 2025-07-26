/**
 * GanttChart Header component - displays month and date headers
 */

import React, { useMemo } from 'react';
import { GANTT_CONSTANTS, getGanttDateRange, getTotalDays } from './constants';

interface GanttHeaderProps {
  headerRef: React.RefObject<HTMLDivElement>;
}

const GanttHeader: React.FC<GanttHeaderProps> = ({ headerRef }) => {
  // Get dynamic date range from MockDB
  const { baseDate } = getGanttDateRange();
  const totalDays = getTotalDays();

  // CSS variables for dynamic sizing
  const cssVars = {
    '--cell-width': `${GANTT_CONSTANTS.CELL_WIDTH}px`,
    '--sidebar-width': `${GANTT_CONSTANTS.SIDEBAR_WIDTH}px`,
    '--header-height': `${GANTT_CONSTANTS.HEADER_HEIGHT}px`,
  } as React.CSSProperties;
  
  // Render month headers
  const monthHeaders = useMemo(() => {
    const months: JSX.Element[] = [];
    let currentMonth = -1;
    let monthStart = 0;
    let monthDays = 0;
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      const month = date.getMonth();
      
      if (month !== currentMonth) {
        if (currentMonth !== -1) {
          months.push(
            <div
              key={`month-${currentMonth}`}
              className="position-absolute border-r border-gray-300 flex-center text-sm font-medium"
              style={{ 
                '--month-start': monthStart,
                '--month-days': monthDays,
                left: `calc(var(--month-start) * var(--cell-width))`,
                width: `calc(var(--month-days) * var(--cell-width))`
              } as React.CSSProperties}
            >
              {new Date(date.getFullYear(), currentMonth).toLocaleString('ko-KR', { month: 'long' })}
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
      const lastDate = new Date(baseDate);
      lastDate.setDate(lastDate.getDate() + totalDays - 1);
      months.push(
        <div
          key={`month-${currentMonth}`}
          className="position-absolute border-r border-gray-300 flex-center text-sm font-medium"
          style={{ 
            '--month-start': monthStart,
            '--month-days': monthDays,
            left: `calc(var(--month-start) * var(--cell-width))`,
            width: `calc(var(--month-days) * var(--cell-width))`
          } as React.CSSProperties}
        >
          {new Date(lastDate.getFullYear(), currentMonth).toLocaleString('ko-KR', { month: 'long' })}
        </div>
      );
    }
    
    return months;
  }, [baseDate, totalDays]);

  // Render date headers
  const dateHeaders = useMemo(() => {
    const headers = [];
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isToday = date.toDateString() === new Date().toDateString();
      
      
      headers.push(
        <div
          key={i}
          className={`position-absolute border-r border-gray-300 text-center text-xs flex-col-center ${
            isWeekend ? 'timeline-weekend text-gray-500' : 'bg-white'
          } ${isToday ? 'timeline-today font-bold text-red-700' : ''}`}
          style={{
            '--date-index': i,
            left: `calc(var(--date-index) * var(--cell-width))`,
            width: 'var(--cell-width)',
            height: '30px'
          } as React.CSSProperties}
        >
          <div className="font-medium">{date.getDate()}</div>
          <div className="text-[10px] text-gray-400">
            {date.toLocaleDateString('ko-KR', { weekday: 'narrow' })}
          </div>
        </div>
      );
    }
    
    return headers;
  }, [baseDate, totalDays]);

  // Today line position
  const todayLinePosition = useMemo(() => {
    const today = new Date();
    const diffTime = today.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0 && diffDays < totalDays) {
      return diffDays * GANTT_CONSTANTS.CELL_WIDTH + GANTT_CONSTANTS.CELL_WIDTH / 2;
    }
    
    return null;
  }, [baseDate, totalDays]);

  return (
    <>
      {/* Project column header */}
      <div 
        className="bg-gray-100 border-b border-r border-gray-300 flex-center font-semibold text-gray-700 w-sidebar h-header"
        style={cssVars}
      >
        Project
      </div>
      
      {/* Date headers */}
      <div
        ref={headerRef}
        className="bg-white border-b border-gray-300 overflow-hidden position-relative h-header"
        style={{ 
          ...cssVars,
          width: 'calc(100% - var(--sidebar-width))'
        }}
      >
        {/* Month headers */}
        <div className="position-relative h-[30px]">
          {monthHeaders}
        </div>
        
        {/* Date headers */}
        <div className="position-relative h-[30px]">
          {dateHeaders}
        </div>
        
        {/* Today line in header */}
        {todayLinePosition !== null && (
          <div
            className="position-absolute top-0 w-0.5 bg-red-500 z-dropdown h-header"
            style={{
              ...cssVars,
              left: todayLinePosition
            }}
          />
        )}
      </div>
    </>
  );
};

export default GanttHeader;