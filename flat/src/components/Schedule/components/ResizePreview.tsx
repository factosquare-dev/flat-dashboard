import React from 'react';
import type { ResizePreview as ResizePreviewType } from '../../../types/schedule';

interface ResizePreviewProps {
  preview: ResizePreviewType;
}

const ResizePreview: React.FC<ResizePreviewProps> = ({ preview }) => {
  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const getDuration = () => {
    const start = new Date(preview.startDate);
    const end = new Date(preview.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days}일`;
  };
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-lg text-sm shadow-xl border border-gray-700" style={{ zIndex: 20000 }}>
      <div className="flex items-center space-x-3">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <div className="flex items-center space-x-2">
          <span className="font-medium">{formatDateShort(preview.startDate)}</span>
          <span className="text-gray-400">~</span>
          <span className="font-medium">{formatDateShort(preview.endDate)}</span>
          <span className="text-gray-400">·</span>
          <span className="text-blue-400 font-medium">{getDuration()}</span>
        </div>
      </div>
    </div>
  );
};

export default ResizePreview;