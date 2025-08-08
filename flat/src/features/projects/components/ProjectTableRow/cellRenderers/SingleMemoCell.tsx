import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import type { Project } from '@/types/project';
import { useMemoColumns } from '@/hooks/useMemoColumns';

interface SingleMemoCellProps {
  project: Project;
  memoId: string;
}

export const SingleMemoCell: React.FC<SingleMemoCellProps> = ({ project, memoId }) => {
  const { getMemoValue, setMemoValue } = useMemoColumns();
  
  const [memo, setMemo] = useState<string>(() => {
    return getMemoValue(project.id, memoId);
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(memo);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Load memo value when component mounts or memoId changes
  useEffect(() => {
    const value = getMemoValue(project.id, memoId);
    setMemo(value);
    setEditValue(value);
  }, [project.id, memoId, getMemoValue]);

  const handleSave = () => {
    setMemo(editValue);
    setMemoValue(project.id, memoId, editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(memo);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <td className="px-2 py-1.5 text-xs">
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="메모 입력..."
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="저장"
          >
            <Save className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCancel();
            }}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="취소"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </td>
    );
  }

  return (
    <td className="px-2 py-1.5 text-xs">
      <div 
        className="group flex items-center justify-between hover:bg-gray-50 cursor-pointer rounded px-1"
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
      >
        <span className="text-gray-700 truncate flex-1">
          {memo || <span className="text-gray-400">클릭하여 메모 추가</span>}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-blue-600 transition-opacity"
          title="편집"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </div>
    </td>
  );
};

export default SingleMemoCell;