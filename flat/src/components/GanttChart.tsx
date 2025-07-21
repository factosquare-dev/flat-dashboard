import React, { useState } from 'react';
import { useScheduleDrag } from '../hooks/useScheduleDrag';
import { getDaysArray, isToday } from '../utils/dateUtils';

const projects = [
  {
    name: "큐셀시스템",
    startDate: "2025-07-15",
    endDate: "2025-07-25",
    color: "bg-blue-500",
  },
  {
    name: "(주)연우",
    startDate: "2025-07-18",
    endDate: "2025-07-22",
    color: "bg-red-500",
  },
  {
    name: "(주)네트모베이지",
    startDate: "2025-07-19",
    endDate: "2025-07-24",
    color: "bg-yellow-500",
  },
  {
    name: "주식회사 코스모로스",
    startDate: "2025-07-20",
    endDate: "2025-07-26",
    color: "bg-cyan-500",
  },
];

const baseDate = new Date("2025-07-01");
const endDate = new Date("2025-08-31");
const dayWidth = 40;
const totalDays = Math.floor((endDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

const getBarPosition = (start: string, end: string) => {
  const startOffset = Math.floor((new Date(start).getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const duration = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return {
    left: `${startOffset * dayWidth}px`,
    width: `${duration * dayWidth}px`,
  };
};


const GanttChart = () => {
  const [scrollPercent, setScrollPercent] = useState(0);
  
  // 날짜 배열 생성
  const days = getDaysArray(baseDate, endDate);
  
  // 업데이트된 훅 사용
  const {
    scrollRef,
    handleSliderChange,
    scrollToToday,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useScheduleDrag(days, scrollPercent, setScrollPercent);

  return (
    <div className="bg-white min-h-screen relative">

      {/* 날짜 헤더 */}
      <div className="h-10 border-b bg-gray-50 overflow-x-hidden" id="date-scroll">
        <div className="flex relative" style={{ minWidth: `${totalDays * dayWidth}px` }}>
          {days.map((date, i) => {
            const label = `${date.getMonth() + 1}/${date.getDate()}`;
            const isTodayDate = isToday(date);
            
            return (
              <div 
                key={i} 
                className={`w-10 h-10 flex items-center justify-center text-xs border-r border-gray-200 flex-shrink-0 ${
                  isTodayDate ? 'bg-red-100 text-red-600 font-bold' : ''
                }`}
              >
                {label}
              </div>
            );
          })}
          
          {/* 오늘 날짜 세로 라인 (헤더) */}
          {(() => {
            const todayIndex = days.findIndex(day => isToday(day));
            return todayIndex >= 0 ? (
              <div
                className="absolute top-0 w-0.5 h-full bg-red-500 z-10 pointer-events-none"
                style={{ left: `${todayIndex * dayWidth + dayWidth / 2}px` }}
              />
            ) : null;
          })()}
        </div>
      </div>

      {/* 간트 차트 */}
      <div className="flex-1 relative">
        <div 
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden h-full" 
          id="timeline-scroll"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="relative" style={{ minWidth: `${totalDays * dayWidth}px`, height: `${projects.length * 80}px` }}>
            {projects.map((project, index) => {
              const { left, width } = getBarPosition(project.startDate, project.endDate);
              return (
                <div key={index} className="h-20 border-b relative">
                  <div
                    className={`absolute top-7 h-6 ${project.color} rounded opacity-80`}
                    style={{ left, width }}
                  >
                    <span className="text-white text-xs px-2">{project.name}</span>
                  </div>
                </div>
              );
            })}
            
            {/* 오늘 날짜 세로 라인 (간트차트) */}
            {(() => {
              const todayIndex = days.findIndex(day => isToday(day));
              return todayIndex >= 0 ? (
                <div
                  className="absolute top-0 w-0.5 bg-red-500 z-20 pointer-events-none opacity-75"
                  style={{ 
                    left: `${todayIndex * dayWidth + dayWidth / 2}px`,
                    height: `${projects.length * 80}px`
                  }}
                >
                  {/* 오늘 날짜 라벨 */}
                  <div className="absolute -top-6 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    오늘
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>

      {/* 하단 슬라이더 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2">
        <div className="flex items-center gap-4 mb-2 text-xs">
          <span className="text-gray-600">스크롤: {scrollPercent.toFixed(1)}%</span>
          <span className="text-gray-500">차트: {totalDays * dayWidth}px ({totalDays}일)</span>
          {(() => {
            const todayIndex = days.findIndex(day => isToday(day));
            return todayIndex >= 0 ? (
              <>
                <span className="text-red-600">오늘: {todayIndex * dayWidth}px</span>
                <span className="text-blue-600">
                  중심: {todayIndex * dayWidth + dayWidth/2}px
                </span>
              </>
            ) : null;
          })()}
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={scrollPercent}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default GanttChart;