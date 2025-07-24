import React from 'react';

interface ProjectRowResizePreviewProps {
  resizePreview: {
    x: number;
    width: number;
    direction: 'start' | 'end';
    taskId: number;
    targetProjectId: string;
  };
}

export const ProjectRowResizePreview: React.FC<ProjectRowResizePreviewProps> = React.memo(({
  resizePreview,
}) => {
  return (
    <div
      className="absolute top-2.5 h-[30px] pointer-events-none transition-all duration-150 ease-out z-[45]"
      style={{
        left: `${resizePreview.x}px`,
        width: `${resizePreview.width}px`,
      }}
    >
      <div className="w-full h-full bg-blue-500/10 border-2 border-dashed border-blue-500 rounded">
        <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 opacity-50" />
        <div className="absolute inset-y-0 right-0 w-1 bg-blue-500 opacity-50" />
      </div>
    </div>
  );
});