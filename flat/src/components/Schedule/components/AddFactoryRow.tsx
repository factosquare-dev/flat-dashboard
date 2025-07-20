import React from 'react';

interface AddFactoryRowProps {
  height: number;
  onAddFactory?: () => void;
}

const AddFactoryRow: React.FC<AddFactoryRowProps> = ({ height, onAddFactory }) => {
  return (
    <div
      className={`border-b border-gray-200 flex items-center transition-all ${onAddFactory ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
      style={{ height: `${height}px`, minHeight: '50px' }}
      onClick={onAddFactory}
    >
      <div className="flex items-center justify-center px-4 py-2 w-full">
        <div className="flex items-center text-gray-500 group-hover:text-blue-600 transition-colors">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs font-medium">공장 추가</span>
        </div>
      </div>
    </div>
  );
};

export default AddFactoryRow;