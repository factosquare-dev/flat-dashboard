import React from 'react';
import MemoTabs from '@/features/projects/MemoTabs';
import type { Project } from '@/types/project';

interface MemoCellProps {
  project: Project;
}

export const MemoCell: React.FC<MemoCellProps> = ({ project }) => {
  return (
    <div className="memo-cell" style={{ padding: '2px 4px' }}>
      <MemoTabs 
        projectId={project.id}
        compact={true}
        maxTabs={3}
        onTabSelect={(tabId) => {
          console.log(`Selected memo tab ${tabId} for project ${project.id}`);
        }}
      />
    </div>
  );
};

export default MemoCell;