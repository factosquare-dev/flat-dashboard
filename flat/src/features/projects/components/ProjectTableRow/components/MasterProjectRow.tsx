/**
 * Master project row component
 */

import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import { ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import type { Column } from '@/hooks/useColumnOrder';
import * as cellRenderers from '../cellRenderers';

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
    <tr className="bg-gray-50 border-y border-gray-200 hover:bg-gray-100 transition-colors">
      <td className="px-4 py-3 sticky left-0 bg-gray-50 hover:bg-gray-100 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      
      {columns.map((column) => {
        if (column.visible === false) return null;
        
        // Special handling for master project cells
        switch (column.id) {
          case 'name':
            return (
              <td key={column.id} className="px-4 py-3 font-semibold text-gray-900" style={{ width: column.width }}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onToggleMaster}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {renderCell(column.id)}
                </div>
              </td>
            );
            
          case 'productType':
          case 'serviceType':
          case 'currentStage':
          case 'status':
          case 'progress':
          case 'client':
          case 'startDate':
          case 'endDate':
          case 'sales':
          case 'purchase':
          case 'depositPaid':
          case 'priority':
            return (
              <td key={column.id} className="px-4 py-3 text-sm font-medium text-gray-700" style={{ width: column.width }}>
                {renderCell(column.id)}
              </td>
            );
            
          case 'manufacturer':
          case 'container':
          case 'packaging':
            // Master projects aggregate factory info from sub projects
            const factoryFieldMap = {
              manufacturer: ProjectFactoryField.MANUFACTURER_ID,
              container: ProjectFactoryField.CONTAINER_ID,
              packaging: ProjectFactoryField.PACKAGING_ID
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
            
            return (
              <td key={column.id} className="px-4 py-3 text-sm text-gray-600" style={{ width: column.width }}>
                <cellRenderers.FactoryCell
                  project={project}
                  factoryField={factoryFieldMap[column.id as keyof typeof factoryFieldMap]}
                  editableCell={dummyEditableCell}
                  onUpdateField={() => {}}
                  isVisible={true}
                />
              </td>
            );
            
          default:
            return (
              <td key={column.id} className="px-4 py-3 text-sm text-gray-600" style={{ width: column.width }}>
                {renderCell(column.id)}
              </td>
            );
        }
      })}
      
      <td className="px-4 py-3 text-sm sticky right-0 bg-gray-50 hover:bg-gray-100 z-10">
        <button
          onClick={handleOptions}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200"
        >
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>
      </td>
    </tr>
  );
};

// Import ProjectFactoryField for factory field mapping
import { ProjectFactoryField } from '@/types/enums';