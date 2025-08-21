import React, { useState, useEffect } from 'react';
import { TaskCheckerSection } from './TaskCheckerSection';
import { TaskCheckerSectionAlt } from './TaskCheckerSectionAlt';
import { getStorageItem, setStorageItem } from '@/shared/utils/storage';

interface TaskCheckerToggleProps {
  projectId?: string;
}

type LayoutMode = 'vertical' | 'horizontal';

const STORAGE_KEY = 'taskCheckerLayout';
const DEFAULT_LAYOUT_MODE: LayoutMode = 'vertical';

export const TaskCheckerToggle: React.FC<TaskCheckerToggleProps> = ({ projectId }) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    const savedMode = getStorageItem<LayoutMode>(STORAGE_KEY);
    return savedMode || DEFAULT_LAYOUT_MODE;
  });

  useEffect(() => {
    setStorageItem(STORAGE_KEY, layoutMode);
  }, [layoutMode]);

  const toggleLayout = () => {
    setLayoutMode(prev => prev === 'vertical' ? 'horizontal' : 'vertical');
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">TASK 체크리스트</h2>
        
        <button
          onClick={toggleLayout}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {layoutMode === 'vertical' ? '가로 보기' : '세로 보기'}
        </button>
      </div>

      <div className="w-full max-w-full">
        {layoutMode === 'vertical' ? (
          <TaskCheckerSection projectId={projectId} />
        ) : (
          <TaskCheckerSectionAlt projectId={projectId} />
        )}
      </div>
    </div>
  );
};