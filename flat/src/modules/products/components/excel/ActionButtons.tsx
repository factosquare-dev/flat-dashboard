import React from 'react';
import { Copy, Trash2 } from 'lucide-react';

interface ActionButtonsProps {
  onDuplicate: () => void;
  onDelete: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onDuplicate, 
  onDelete 
}) => (
  <div className="flex justify-center gap-0.5">
    <button
      onClick={onDuplicate}
      className="p-0.5 hover:bg-blue-100 rounded transition-colors"
      title="복사"
    >
      <Copy className="w-3 h-3 text-blue-600" />
    </button>
    <button
      onClick={onDelete}
      className="p-0.5 hover:bg-red-100 rounded transition-colors"
      title="삭제"
    >
      <Trash2 className="w-3 h-3 text-red-600" />
    </button>
  </div>
);