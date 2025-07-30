import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';

interface DepositPaidCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onStartDrag?: () => void;
  isDragging?: boolean;
}

// Separate component for checkbox to maintain local state
const DepositPaidCheckbox: React.FC<DepositPaidCheckboxProps> = ({ 
  checked, 
  onChange, 
  onStartDrag, 
  isDragging 
}) => {
  const [localChecked, setLocalChecked] = React.useState(checked);
  
  // Sync with props
  React.useEffect(() => {
    setLocalChecked(checked);
  }, [checked]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newValue = e.target.checked;
    setLocalChecked(newValue); // Update local state immediately
    onChange(newValue); // Then update parent
  };
  
  return (
    <input
      type="checkbox"
      checked={localChecked}
      onChange={handleChange}
      onMouseDown={(e) => {
        e.stopPropagation();
        if (onStartDrag) {
          onStartDrag();
        }
      }}
      onMouseEnter={(e) => {
        if (isDragging && e.buttons === 1) {
          e.stopPropagation();
        }
      }}
      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
      style={{ userSelect: 'none' }}
    />
  );
};

interface CellRenderProps {
  project: Project;
  onUpdateField: (projectId: ProjectId, field: keyof Project, value: Project[keyof Project]) => void;
  index?: number;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
}

export const renderDepositPaid = ({ project, onUpdateField, index, isDragging, onStartDrag }: CellRenderProps) => {
  return (
    <td 
      className="px-3 py-1.5 text-center" 
      onClick={(e) => e.stopPropagation()}
    >
      <DepositPaidCheckbox
        checked={project.depositPaid || false}
        onChange={(checked) => onUpdateField(project.id, 'depositPaid', checked)}
        onStartDrag={index !== undefined && onStartDrag ? () => onStartDrag(index) : undefined}
        isDragging={isDragging}
      />
    </td>
  );
};