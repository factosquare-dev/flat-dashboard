import React from 'react';

interface ScrollControlsProps {
  sliderValue: number;
  onSliderChange: (value: number) => void;
  onTodayClick: () => void;
}

const ScrollControls: React.FC<ScrollControlsProps> = ({
  sliderValue,
  onSliderChange,
  onTodayClick
}) => {
  return (
    <div className="flex items-center gap-4 mt-4 p-4 bg-white rounded-lg shadow">
      <button
        onClick={onTodayClick}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        오늘로 이동
      </button>
      <div className="flex-1 flex items-center gap-4">
        <span className="text-sm text-gray-600">스크롤:</span>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={(e) => onSliderChange(Number(e.target.value))}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default ScrollControls;