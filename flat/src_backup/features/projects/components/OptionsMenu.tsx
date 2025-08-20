import React, { useEffect, useRef, useState } from 'react';

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
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let newLeft = position.left;
      let newTop = position.top;
      
      // Check if menu goes beyond right edge
      if (rect.right > viewportWidth) {
        newLeft = Math.max(10, viewportWidth - rect.width - 10);
      }
      
      // Check if menu goes beyond bottom edge
      if (rect.bottom > viewportHeight) {
        newTop = Math.max(10, viewportHeight - rect.height - 10);
      }
      
      // Check if menu goes beyond left edge
      if (rect.left < 0) {
        newLeft = 10;
      }
      
      // Check if menu goes beyond top edge
      if (rect.top < 0) {
        newTop = 10;
      }
      
      if (newLeft !== position.left || newTop !== position.top) {
        setAdjustedPosition({ left: newLeft, top: newTop });
      }
    }
  }, [position]);

  return (
    <div 
      ref={menuRef}
      className="fixed z-50 options-menu-dropdown" 
      style={{ top: `${adjustedPosition.top}px`, left: `${adjustedPosition.left}px` }}
    >
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