import React, { useEffect, useState } from 'react';

const projects = [
  {
    name: "큐셀시스템",
    startDate: "2025-01-09",
    endDate: "2025-03-18",
    color: "bg-blue-500",
  },
  {
    name: "(주)연우",
    startDate: "2025-01-15",
    endDate: "2025-03-07",
    color: "bg-red-500",
  },
  {
    name: "(주)네트모베이지",
    startDate: "2025-01-25",
    endDate: "2025-03-07",
    color: "bg-yellow-500",
  },
  {
    name: "주식회사 코스모로스",
    startDate: "2025-01-09",
    endDate: "2025-03-18",
    color: "bg-cyan-500",
  },
];

const baseDate = new Date("2025-01-09");
const endDate = new Date("2025-03-18");
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

  useEffect(() => {
    const scroll = document.getElementById('timeline-scroll');
    if (scroll) {
      scroll.scrollLeft = (scroll.scrollWidth - scroll.clientWidth) * (scrollPercent / 100);
    }
  }, [scrollPercent]);

  return (
    <div className="bg-white min-h-screen relative">
      {/* 날짜 헤더 */}
      <div className="h-10 border-b bg-gray-50 overflow-x-hidden" id="date-scroll">
        <div className="flex" style={{ minWidth: `${totalDays * dayWidth}px` }}>
          {Array.from({ length: totalDays }, (_, i) => {
            const date = new Date(baseDate);
            date.setDate(date.getDate() + i);
            const label = `${date.getMonth() + 1}/${date.getDate()}`;
            return (
              <div key={i} className="w-10 h-10 flex items-center justify-center text-xs border-r border-gray-200 flex-shrink-0">
                {label}
              </div>
            );
          })}
        </div>
      </div>

      {/* 간트 차트 */}
      <div className="flex-1 relative">
        <div className="overflow-x-auto overflow-y-hidden h-full" id="timeline-scroll">
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
          </div>
        </div>
      </div>

      {/* 하단 슬라이더 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2">
        <input
          type="range"
          min="0"
          max="100"
          value={scrollPercent}
          onChange={(e) => setScrollPercent(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default GanttChart;