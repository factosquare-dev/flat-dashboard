import React, { useState, useEffect, useRef } from 'react';
import type { Project } from '@/shared/types/project';
import { useMemoColumns } from '@/shared/hooks/useMemoColumns';

interface SingleMemoCellProps {
  project: Project;
  memoId: string;
}

export const SingleMemoCell: React.FC<SingleMemoCellProps> = ({ project, memoId }) => {
  const { getMemoValue, setMemoValue } = useMemoColumns();
  
  const [memo, setMemo] = useState<string>(() => {
    const value = getMemoValue(project.id, memoId);
    console.log('[SingleMemoCell] Initial memo value:', { projectId: project.id, memoId, value });
    return value;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(memo);
  const inputRef = useRef<HTMLInputElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  // Handle click outside to cancel edit
  useEffect(() => {
    if (!isEditing) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (cellRef.current && !cellRef.current.contains(e.target as Node)) {
        console.log('[SingleMemoCell] Clicked outside, canceling edit');
        setEditValue(memo);
        setIsEditing(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, memo]);

  // Load memo value when component mounts or memoId changes
  useEffect(() => {
    const value = getMemoValue(project.id, memoId);
    setMemo(value);
    setEditValue(value);
  }, [project.id, memoId, getMemoValue]);

  const handleSave = () => {
    console.log('[SingleMemoCell] Saving memo:', { projectId: project.id, memoId, value: editValue });
    setMemo(editValue);
    setMemoValue(project.id, memoId, editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    console.log('[SingleMemoCell] Canceling memo edit');
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
      <td className="px-2 py-1.5 text-xs memo-cell" data-memo-cell="true">
        <div ref={cellRef} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            onBlur={() => {
              // Blur will be handled by click outside
            }}
            className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="메모 입력..."
          />
          <div className="absolute -bottom-6 left-0 text-[10px] text-gray-400 whitespace-nowrap">
            Enter: 저장 | ESC: 취소
          </div>
        </div>
      </td>
    );
  }

  return (
    <td className="px-2 py-1.5 text-xs memo-cell" data-memo-cell="true">
      <div 
        className="group hover:bg-gray-50 cursor-pointer rounded px-2 py-1 min-h-[24px] flex items-center"
        onClick={(e) => {
          e.stopPropagation();
          console.log('[SingleMemoCell] Cell clicked, starting edit mode');
          setIsEditing(true);
          setEditValue(memo);
        }}
        title="클릭하여 편집"
      >
        <span className="text-gray-700 truncate">
          {memo || <span className="text-gray-400 italic">메모 추가...</span>}
        </span>
      </div>
    </td>
  );
};

export default SingleMemoCell;