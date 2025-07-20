import React from 'react';

interface OptionsMenuProps {
  projectId: string;
  position: { top: number; left: number };
  onEdit: (projectId: string) => void;
  onDelete: (projectId: string) => void;
  onDuplicate: (projectId: string) => void;
  onClose: () => void;
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  projectId,
  position,
  onEdit,
  onDelete,
  onDuplicate,
  onClose
}) => {
  return (
    <div className="fixed z-50 options-menu-dropdown" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(projectId);
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          수정
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(projectId);
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          복사
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(projectId);
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  );
};

export default OptionsMenu;