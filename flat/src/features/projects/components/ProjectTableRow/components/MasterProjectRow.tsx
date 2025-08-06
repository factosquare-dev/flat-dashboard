/**
 * Master project row component
 */

import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import { MoreVertical } from 'lucide-react';
import type { Column } from '@/hooks/useColumnOrder';
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
}

export const MasterProjectRow: React.FC<MasterProjectRowProps> = ({
  project,
  columns,
  isSelected,
  isExpanded,
  onSelect,
  onToggleMaster,
  onShowOptionsMenu,
  renderCell
}) => {
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

  return (
    <tr className="group border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150 cursor-pointer">
      <td className="px-4 py-2 w-12">
        <SelectionCell
          project={project}
          isExpanded={isExpanded}
          isSelected={isSelected}
          onSelect={onSelect}
          handleToggleTasks={() => {}}
          handleMasterToggle={onToggleMaster}
        />
      </td>
      
      {columns.map((column) => {
        if (column.visible === false) return null;
        
        // Special handling for master project cells
        switch (column.id) {
          case ProjectField.NAME: {
            // For master project name, just display the name (chevron is in SelectionCell now)
            return (
              <td key={column.id} className="px-3 py-1.5 text-xs font-semibold text-gray-900" style={{ width: column.width }}>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {project.name}
                </div>
              </td>
            );
          }
            
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
            const cellContent = renderCell(column.id);
            if (React.isValidElement(cellContent)) {
              return React.cloneElement(cellContent, { key: column.id });
            }
            return cellContent;
          }
          
          case ProjectField.PRIORITY: {
            // Master 프로젝트는 우선순위를 표시하지 않음
            return (
              <td key={column.id} className="px-3 py-1.5 text-xs text-gray-400">
                
              </td>
            );
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
            
            return React.cloneElement(factoryCell as React.ReactElement, {
              key: column.id
            });
          }
            
          default: {
            const defaultContent = renderCell(column.id);
            // Most cells return td elements, just add key
            if (React.isValidElement(defaultContent)) {
              return React.cloneElement(defaultContent, { key: column.id });
            }
            // Fallback for non-element content
            return (
              <td key={column.id} className="px-4 py-3 text-sm text-gray-600" style={{ width: column.width }}>
                {defaultContent}
              </td>
            );
          }
        }
      })}
      
      <td className="px-4 py-2 text-sm w-12">
        <button
          onClick={handleOptions}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
      </td>
    </tr>
  );
};

// Import enums for field mapping
import { ProjectFactoryField, ProjectField } from '@/types/enums';