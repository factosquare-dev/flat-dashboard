import React from 'react';
import type { ResizePreview as ResizePreviewType } from '../../../types/schedule';

interface ResizePreviewProps {
  preview: ResizePreviewType;
}

const ResizePreview: React.FC<ResizePreviewProps> = ({ preview }) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm z-50 shadow-lg">
      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{preview.startDate} ~ {preview.endDate}</span>
      </div>
    </div>
  );
};

export default ResizePreview;