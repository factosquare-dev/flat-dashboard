/**
 * Master project row component
 */

import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import { MoreVertical } from 'lucide-react';
import type { Column } from '@/hooks/useColumnOrder';
import { ProjectField, ProjectFactoryField, TableColumnId } from '@/types/enums';
import * as cellRenderers from '../cellRenderers';
import SelectionCell from '../SelectionCell';

interface MasterProjectRowProps {
  project: Project;
  columns: Column[];
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (checked: boolean) => void;
  onToggleMaster: () => void;
  onShowOptionsMenu: (projectId: ProjectId, position: { top: number; left: number }, event?: React.MouseEvent) => void;
  renderCell: (columnId: string) => React.ReactNode;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, project: Project) => void;
}

export const MasterProjectRow: React.FC<MasterProjectRowProps> = ({
  project,
  columns,
  isSelected,
  isExpanded,
  onSelect,
  onToggleMaster,
  onShowOptionsMenu,
  renderCell,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const handleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const position = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    };
    onShowOptionsMenu(project.id, position, e);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`[DragDrop MasterRow] 📍 OVER: ${project.name} (MASTER)`);
    setIsDragOver(true);
    onDragOver?.(e);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    console.log(`[DragDrop MasterRow] 👋 LEAVE: ${project.name}`);
    setIsDragOver(false);
    onDragLeave?.(e);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`[DragDrop MasterRow] 💧 DROP on: ${project.name} (MASTER)`);
    setIsDragOver(false);
    onDrop?.(e, project);
  };

  return (
    <tr 
      className={`group border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150 cursor-pointer ${
        isDragOver ? 'bg-blue-50' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <td className="pl-6 pr-2 py-2 w-14">
        <SelectionCell
          project={project}
          isExpanded={isExpanded}
          isSelected={isSelected}
          onSelect={onSelect}
          handleToggleTasks={() => {}}
          handleMasterToggle={onToggleMaster}
          level={(project as any).level || 0}
        />
      </td>
      
      {columns.map((column, index) => {
        if (column.visible === false) return null;
        
        // Check if this is a memo column and if it's the last one
        const isMemoColumn = column.id.startsWith('memo-');
        const nextColumn = columns[index + 1];
        const isLastMemoColumn = isMemoColumn && 
          (!nextColumn || !nextColumn.id.startsWith('memo-'));
        
        // Also check if we need to add button space after LAB_NUMBER when no memos exist
        const hasMemoColumns = columns.some(col => col.id.startsWith('memo-'));
        const isLabNumberColumn = column.id === TableColumnId.LAB_NUMBER;
        const needsButtonSpace = isLastMemoColumn || (isLabNumberColumn && !hasMemoColumns);
        
        let cellContent: React.ReactNode = null;
        
        // Special handling for master project cells
        switch (column.id) {
          case ProjectField.NAME: {
            // For master project name, just display the name (chevron is in SelectionCell now)
            cellContent = (
              <td key={column.id} className="px-3 py-1.5 text-xs font-semibold text-gray-900" style={{ width: column.width }}>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {project.name}
                </div>
              </td>
            );
            break;
          }
            
          case ProjectField.LAB_NUMBER:
          case 'productType': // Custom field - not in ProjectField enum
          case ProjectField.SERVICE_TYPE:
          case 'currentStage': // Custom field - not in ProjectField enum
          case ProjectField.STATUS:
          case ProjectField.PROGRESS:
          case 'client': // Custom field - maps to customer
          case ProjectField.START_DATE:
          case ProjectField.END_DATE:
          case ProjectField.SALES:
          case ProjectField.PURCHASE:
          case ProjectField.DEPOSIT_PAID: {
            // Use the same cells as Sub projects - they already have proper styling
            const content = renderCell(column.id);
            if (React.isValidElement(content)) {
              cellContent = React.cloneElement(content, { key: column.id });
            } else {
              cellContent = content;
            }
            break;
          }
          
          case ProjectField.PRIORITY: {
            // Master 프로젝트는 우선순위를 표시하지 않음
            cellContent = (
              <td key={column.id} className="px-3 py-1.5 text-xs text-gray-400">
                
              </td>
            );
            break;
          }
            
          case ProjectField.MANUFACTURER:
          case ProjectField.CONTAINER:
          case ProjectField.PACKAGING: {
            // Master projects aggregate factory info from sub projects
            const factoryFieldMap = {
              [ProjectField.MANUFACTURER]: ProjectFactoryField.MANUFACTURER,
              [ProjectField.CONTAINER]: ProjectFactoryField.CONTAINER,
              [ProjectField.PACKAGING]: ProjectFactoryField.PACKAGING
            };
            
            // Create dummy editableCell for master projects (read-only)
            const dummyEditableCell = {
              editingCell: null,
              searchValue: '',
              searchSuggestions: [],
              showSuggestions: false,
              setShowSuggestions: () => {},
              startEditing: () => {},
              stopEditing: () => {},
              isEditing: () => false,
              handleSearch: () => {}
            };
            
            // FactoryCell already returns a td element, just add key
            const factoryCell = (
              <cellRenderers.FactoryCell
                project={project}
                field={factoryFieldMap[column.id as keyof typeof factoryFieldMap]}
                editableCell={dummyEditableCell}
                onUpdateField={() => {}}
                isVisible={true}
              />
            );
            
            cellContent = React.cloneElement(factoryCell as React.ReactElement, {
              key: column.id
            });
            break;
          }
            
          default: {
            const defaultContent = renderCell(column.id);
            // Most cells return td elements, just add key
            if (React.isValidElement(defaultContent)) {
              cellContent = React.cloneElement(defaultContent, { key: column.id });
            } else {
              // Fallback for non-element content
              cellContent = (
                <td key={column.id} className="px-4 py-3 text-sm text-gray-600" style={{ width: column.width }}>
                  {defaultContent}
                </td>
              );
            }
            break;
          }
        }
        
        return (
          <React.Fragment key={column.id}>
            {cellContent}
            {needsButtonSpace && (
              <td className="px-2 py-1.5 text-xs w-12"></td>
            )}
          </React.Fragment>
        );
      })}
      
      <td className="px-4 py-2 text-sm w-12">
        <button
          onClick={handleOptions}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
      </td>
    </tr>
  );
};