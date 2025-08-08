import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import EditableCell from '@/features/projects/components/EditableCell';
import type { UseEditableCellReturn } from '@/hooks/useEditableCell';
import { EditableCellType, ProjectType } from '@/types/enums';
import { isProjectType } from '@/utils/projectTypeUtils';
import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';

interface CellRenderProps {
  project: Project;
  editableCell: UseEditableCellReturn;
  onUpdateField: (projectId: ProjectId, field: keyof Project, value: Project[keyof Project]) => void;
}

export const renderLabNumber = ({ project, editableCell, onUpdateField }: CellRenderProps) => {
  // Master 프로젝트는 SUB 프로젝트들의 랩넘버를 종합해서 표시
  const isMaster = isProjectType(project.type, ProjectType.MASTER);
  
  if (isMaster) {
    // Get all SUB projects' lab numbers
    const db = MockDatabaseImpl.getInstance();
    const allProjects = Array.from(db.getDatabase().projects.values());
    const subProjects = allProjects.filter(p => 
      p.type === ProjectType.SUB && p.parentId === project.id
    );
    
    // Collect unique lab numbers from SUB projects
    const labNumbers = subProjects
      .map(sub => sub.labNumber)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    
    const displayText = labNumbers.length > 0 ? labNumbers.join(', ') : '';
    const tooltipText = labNumbers.length > 2 
      ? `${labNumbers.length}개 랩넘버: ${labNumbers.join(', ')}` 
      : displayText;
    
    return (
      <td className="px-3 py-1.5 text-xs text-gray-900 min-w-[120px]" title={tooltipText}>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          {labNumbers.length > 2 ? `${labNumbers.slice(0, 2).join(', ')}... (+${labNumbers.length - 2})` : displayText}
        </div>
      </td>
    );
  }
  
  return (
    <EditableCell
      project={project}
      field="labNumber"
      type={EditableCellType.TEXT}
      editableCell={editableCell}
      onUpdate={onUpdateField}
      placeholder="랩넘버 입력"
    />
  );
};

// Component export for use in cellRenderer
export const LabNumberCell = (props: CellRenderProps) => {
  return renderLabNumber(props);
};

// Default export for convenience
export default LabNumberCell;