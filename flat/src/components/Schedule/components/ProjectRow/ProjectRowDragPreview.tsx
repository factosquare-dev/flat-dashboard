import React from 'react';

interface ProjectRowDragPreviewProps {
  dragPreview: {
    dropX: number;
    width: number;
    targetProjectId: string;
  };
  cellWidth: number;
}

export const ProjectRowDragPreview: React.FC<ProjectRowDragPreviewProps> = React.memo(({
  dragPreview,
  cellWidth,
}) => {
  return (
    <div
      className="absolute top-2.5 h-[30px] pointer-events-none shadow-lg transition-all duration-200 ease-out z-40"
      style={{
        left: `${dragPreview.dropX}px`,
        width: `${dragPreview.width}px`,
        transform: 'translateY(0)',
        opacity: 0.5,
      }}
    >
      <div className="w-full h-full bg-blue-500/20 border-2 border-dashed border-blue-500 rounded" />
    </div>
  );
});