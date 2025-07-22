import React from 'react';
import type { Project } from '../../types/project';
import { formatCurrency, parseCurrency } from '../../utils/currency';
import { factoriesByType } from '../../data/mockData';

interface EditableCellProps {
  project: Project;
  field: keyof Project;
  type: 'text' | 'search' | 'date' | 'currency';
  editableCell: any; // Use the return type from useEditableCell
  onUpdate: (projectId: string, field: keyof Project, value: any) => void;
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

  const value = project[field];
  const editing = isEditing(project.id, field);

  if (type === 'search' && editing) {
    // 필드에 따라 다른 공장 리스트 사용
    let searchList: string[] = [];
    if (field === 'manufacturer') {
      searchList = factoriesByType.manufacturing.map(f => f.name);
    } else if (field === 'container') {
      searchList = factoriesByType.container.map(f => f.name);
    } else if (field === 'packaging') {
      searchList = factoriesByType.packaging.map(f => f.name);
    }
    
    return (
      <td className="px-1.5 py-1.5 relative js-inline-edit">
        <div className="relative w-full">
          <input
            type="text"
            defaultValue={value as string}
            onChange={(e) => handleSearch(e.target.value, searchList)}
            onBlur={() => {
              setTimeout(() => {
                stopEditing();
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
  
  if (type === 'date' && editing) {
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
          onClick={(e) => {
            e.stopPropagation();
            (e.target as HTMLInputElement).showPicker?.();
          }}
          className="w-full px-2 py-1 bg-white border border-blue-500 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </td>
    );
  }
  
  if (type === 'currency' && editing) {
    return (
      <td className="px-1.5 py-1.5 js-inline-edit text-center">
        <input
          type="number"
          defaultValue={value}
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
  
  // Display mode
  return (
    <td 
      className={`px-2 py-2 text-xs text-gray-700 cursor-pointer group js-inline-edit ${
        type === 'currency' ? 'text-right' : type === 'date' ? 'text-center' : ''
      }`}
      onClick={(e) => {
        e.stopPropagation();
        startEditing(project.id, field);
      }}
    >
      <div className="relative">
        <div className={`${type === 'currency' ? 'tabular-nums' : type === 'date' ? 'whitespace-nowrap' : 'truncate max-w-[140px]'} group-hover:text-gray-900 transition-colors`} title={value as string}>
          {type === 'currency' ? formatCurrency(parseInt(value as string)) : 
           type === 'date' ? new Date(value as string).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '') :
           value}
        </div>
      </div>
    </td>
  );
};

export default EditableCell;