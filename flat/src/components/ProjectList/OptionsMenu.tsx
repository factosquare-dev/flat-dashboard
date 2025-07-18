import React from 'react';

interface OptionsMenuProps {
  projectId: string;
  position: { top: number; left: number };
  onEdit: (projectId: string) => void;
  onDelete: (projectId: string) => void;
  onClose: () => void;
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  projectId,
  position,
  onEdit,
  onDelete,
  onClose
}) => {
  return (
    <div className="fixed z-50" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
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
            if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
              onDelete(projectId);
            }
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