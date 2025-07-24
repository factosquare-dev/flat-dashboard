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
              className="border-r border-gray-300 flex items-center justify-center text-sm font-medium"
              style={{ 
                position: 'absolute',
                left: monthStart * GANTT_CONSTANTS.CELL_WIDTH,
                width: monthDays * GANTT_CONSTANTS.CELL_WIDTH
              }}
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
          {new Date(date.getFullYear(), currentMonth).toLocaleString('ko-KR', { month: 'long' })}
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
          className={`border-r border-gray-300 text-center text-xs flex flex-col items-center justify-center ${
            isWeekend ? 'bg-gray-100 text-gray-500' : 'bg-white'
          } ${isToday ? 'bg-red-100 font-bold text-red-700' : ''}`}
          style={{
            position: 'absolute',
            left: i * GANTT_CONSTANTS.CELL_WIDTH,
            width: GANTT_CONSTANTS.CELL_WIDTH,
            height: 30
          }}
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
      <div className="bg-gray-100 border-b border-r border-gray-300 flex items-center justify-center font-semibold text-gray-700"
           style={{ width: GANTT_CONSTANTS.SIDEBAR_WIDTH, height: GANTT_CONSTANTS.HEADER_HEIGHT }}>
        Project
      </div>
      
      {/* Date headers */}
      <div
        ref={headerRef}
        className="bg-white border-b border-gray-300 overflow-hidden relative"
        style={{ 
          width: `calc(100% - ${GANTT_CONSTANTS.SIDEBAR_WIDTH}px)`,
          height: GANTT_CONSTANTS.HEADER_HEIGHT
        }}
      >
        {/* Month headers */}
        <div className="relative" style={{ height: 30 }}>
          {monthHeaders}
        </div>
        
        {/* Date headers */}
        <div className="relative" style={{ height: 30 }}>
          {dateHeaders}
        </div>
        
        {/* Today line in header */}
        {todayLinePosition !== null && (
          <div
            className="absolute top-0 w-0.5 bg-red-500 z-10"
            style={{
              left: todayLinePosition,
              height: GANTT_CONSTANTS.HEADER_HEIGHT
            }}
          />
        )}
      </div>
    </>
  );
};

export default GanttHeader;