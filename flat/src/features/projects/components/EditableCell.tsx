import React, { useRef, useEffect } from 'react';
import type { Project } from '../../../types/project';
import type { ProjectId } from '../../../types/branded';
import { formatKoreanNumber, parseKoreanNumber } from '@/utils/coreUtils';
import { formatDate } from '@/utils/unifiedDateUtils';
import { getFactoriesByType } from '@/utils/factoryUtils';
import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';
import { EditableCellType, FactoryType, ProjectField } from '@/types/enums';

interface EditableCellProps {
  project: Project;
  field: keyof Project;
  type: EditableCellType;
  editableCell: any; // Use the return type from useEditableCell
  onUpdate: (projectId: ProjectId, field: keyof Project, value: any) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  project,
  field,
  type,
  editableCell,
  onUpdate
}) => {
  const {
    searchValue,
    searchSuggestions,
    showSuggestions,
    setShowSuggestions,
    startEditing,
    stopEditing,
    isEditing,
    handleSearch
  } = editableCell;
  
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const value = project[field];
  const editing = isEditing(project.id, field);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  if (type === EditableCellType.SEARCH && editing) {
    // 필드에 따라 다른 검색 리스트 사용
    let searchList: string[] = [];
    if (field === ProjectField.CLIENT) {
      // Mock DB에서 고객사 리스트 가져오기
      try {
        const db = MockDatabaseImpl.getInstance();
        const database = db.getDatabase();
        const customers = Array.from(database.customers.values());
        searchList = customers.map(c => c.name);
      } catch (error) {
        searchList = ['뷰티코리아', '그린코스메틱', '코스메디칼', '퍼스트뷰티'];
      }
    } else if (field === ProjectField.MANUFACTURER_ID) {
      searchList = getFactoriesByType(FactoryType.MANUFACTURING).map(f => f.name);
    } else if (field === ProjectField.CONTAINER_ID) {
      searchList = getFactoriesByType(FactoryType.CONTAINER).map(f => f.name);
    } else if (field === ProjectField.PACKAGING_ID) {
      searchList = getFactoriesByType(FactoryType.PACKAGING).map(f => f.name);
    }
    
    return (
      <td className="px-1.5 py-1.5 relative js-inline-edit">
        <div className="relative w-full">
          <input
            type="text"
            defaultValue={value as string}
            onChange={(e) => handleSearch(e.target.value, searchList)}
            onBlur={() => {
              // Clear any existing timeout
              if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
              }
              // Set new timeout
              blurTimeoutRef.current = setTimeout(() => {
                stopEditing();
                blurTimeoutRef.current = null;
              }, 200);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onUpdate(project.id, field, (e.target as HTMLInputElement).value || value);
                stopEditing();
              } else if (e.key === 'Escape') {
                stopEditing();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full px-2 py-1 bg-white border border-blue-500 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {searchSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(project.id, field, suggestion);
                    stopEditing();
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
    );
  }
  
  if (type === EditableCellType.DATE && editing) {
    return (
      <td className="px-1.5 py-1.5 js-inline-edit text-center">
        <input
          type="date"
          defaultValue={value as string}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onUpdate(project.id, field, (e.target as HTMLInputElement).value);
              stopEditing();
            } else if (e.key === 'Escape') {
              stopEditing();
            }
          }}
          onChange={(e) => {
            onUpdate(project.id, field, e.target.value);
          }}
          onBlur={() => {
            stopEditing();
          }}
          onFocus={(e) => {
            // 포커스 시 달력 자동 열기
            e.stopPropagation();
            try {
              (e.target as HTMLInputElement).showPicker?.();
            } catch (error) {
              // showPicker가 지원되지 않는 브라우저에서는 무시
            }
          }}
          className="w-[90px] px-1 py-0.5 bg-white border border-blue-500 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          autoFocus
        />
      </td>
    );
  }
  
  if (type === EditableCellType.TEXT && editing) {
    return (
      <td className="px-1.5 py-1.5 js-inline-edit">
        <input
          type="text"
          defaultValue={value as string}
          onBlur={() => {
            stopEditing();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onUpdate(project.id, field, (e.target as HTMLInputElement).value);
              stopEditing();
            } else if (e.key === 'Escape') {
              stopEditing();
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full px-2 py-1 bg-white border border-blue-500 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </td>
    );
  }
  
  if (type === EditableCellType.CURRENCY && editing) {
    // Parse the current value to get the raw number
    const currentValue = value ? parseKoreanNumber(value.toString()) : '';
    
    return (
      <td className="px-1.5 py-1.5 js-inline-edit text-center">
        <input
          type="number"
          defaultValue={currentValue}
          onBlur={() => {
            stopEditing();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const numValue = (e.target as HTMLInputElement).value;
              onUpdate(project.id, field, numValue);
              stopEditing();
            } else if (e.key === 'Escape') {
              stopEditing();
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full px-2 py-1 bg-white border border-blue-500 rounded text-xs text-right focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          autoFocus
        />
      </td>
    );
  }
  
  // Display mode - wrapped in td
  return (
    <td className="px-3 py-1.5 text-xs text-gray-900">
      <div 
        className={`cursor-pointer ${
          type === EditableCellType.CURRENCY ? 'text-right' : type === EditableCellType.DATE ? 'text-center' : ''
        }`}
        onClick={(e) => {
          e.stopPropagation();
          startEditing(project.id, field);
        }}
      >
        <div className={type === EditableCellType.CURRENCY ? 'overflow-hidden text-ellipsis whitespace-nowrap' : 'relative'}>
          <div className={`${type === EditableCellType.CURRENCY ? 'text-blue-600 font-medium' : type === EditableCellType.DATE ? 'whitespace-nowrap' : 'truncate max-w-[140px]'} transition-colors`} title={value as string}>
            {type === EditableCellType.CURRENCY ? 
              (value !== null && value !== undefined && value !== '' ? `${formatKoreanNumber(value)}원` : '0원') : 
             type === EditableCellType.DATE ? formatDate(value as string, 'yy-MM-dd') :
             (value instanceof Date ? formatDate(value, 'yy-MM-dd') : value || '')}
          </div>
        </div>
      </div>
    </td>
  );
};

export default EditableCell;