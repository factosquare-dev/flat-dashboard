/**
 * Master project row component
 */

import React from 'react';
import type { Project } from '@/shared/types/project';
import type { ProjectId } from '@/shared/types/branded';
import { MoreVertical } from 'lucide-react';
import type { Column } from '@/shared/hooks/useColumnOrder';
import { ProjectField, ProjectFactoryField, TableColumnId } from '@/shared/types/enums';
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
  onRowClick?: (project: Project) => void;
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
  onRowClick,
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

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if clicking on interactive elements
    const isInteractive = target.closest(
      'button, input, select, textarea, a, ' +
      '.js-inline-edit, .editable-cell, ' +
      '.modal-input, .SearchBox, ' +
      '[contenteditable="true"], ' +
      '[role="combobox"], [role="listbox"], ' +
      '.factory-cell, .date-picker, ' +
      '.memo-cell, [data-memo-cell="true"]'
    );
    
    if (!isInteractive && onRowClick) {
      onRowClick(project);
    }
  };

  return (
    <tr 
      className={`group border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150 cursor-pointer ${
        isDragOver ? 'bg-blue-50' : ''
      }`}
      onClick={handleRowClick}
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
      
      {columns.map((column) => {
        if (column.visible === false) return null;
        
        let cellContent: React.ReactNode = null;
        
        // Special handling for master project cells
        switch (column.id) {
          case ProjectField.NAME: {
            // Use renderCell to get EditableCell for master project name
            cellContent = renderCell(column.id);
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
        
        return cellContent;
      })}
      
      {/* Add memo button column - empty cell */}
      <td className="px-2 py-1.5 text-xs w-12"></td>
      
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