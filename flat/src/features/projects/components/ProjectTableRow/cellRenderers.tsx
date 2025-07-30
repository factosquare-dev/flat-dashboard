import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import EditableCell from '../EditableCell';
import SearchableCell from '../SearchableCell';
import PriorityDropdown from '../PriorityDropdown';
import ServiceTypeDropdown from '../ServiceTypeDropdown';
import StatusDropdown from '../StatusDropdown';
import ProductTypeDropdown from '../ProductTypeDropdown';
import ProgressBar from '../ProgressBar';
import type { UseEditableCellReturn } from '@/hooks/useEditableCell';
import { ProjectType, EditableCellType, FactoryType } from '@/types/enums';
import { isProjectType } from '@/utils/projectTypeUtils';
import { getSubProjectCount } from '@/utils/projectUtils';
import { mockDataService } from '@/services/mockDataService';
import { isToday, isDateInRange } from '@/utils/unifiedDateUtils';
import { factoriesByType } from '@/data/mockData';
import { simplifyCompanyName } from '@/utils/coreUtils';
import SearchBox from '../SearchBox';

interface CellRenderProps {
  project: Project;
  editableCell: UseEditableCellReturn;
  onUpdateField: (projectId: ProjectId, field: keyof Project, value: Project[keyof Project]) => void;
  index?: number;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
}

export const renderName = ({ project, editableCell, onUpdateField }: CellRenderProps) => (
  <EditableCell
    project={project}
    field="name"
    type={EditableCellType.TEXT}
    editableCell={editableCell}
    onUpdate={onUpdateField}
  />
);

export const renderProductType = ({ project, onUpdateField }: CellRenderProps) => {
  // MASTER 프로젝트의 경우 서브 프로젝트 개수 표시
  if (isProjectType(project.type, ProjectType.MASTER)) {
    const subProjectCount = getSubProjectCount(project.id);
    return (
      <td className="px-3 py-1.5 text-xs text-gray-900 min-w-[120px]">
        <div className="text-left">
          {subProjectCount > 0 ? `${subProjectCount}종` : '-'}
        </div>
      </td>
    );
  }
  
  // SUB 프로젝트의 경우 드롭다운으로 선택 가능
  if (isProjectType(project.type, ProjectType.SUB)) {
    return (
      <td className="px-3 py-1.5 min-w-[120px]">
        <ProductTypeDropdown
          value={project.productType}
          onChange={(value) => onUpdateField(project.id, 'productType', value)}
        />
      </td>
    );
  }
  
  // 기본적으로 텍스트로 표시
  return (
    <td className="px-3 py-1.5 text-xs text-gray-900 min-w-[120px]" title={project.productType}>
      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
        {project.productType}
      </div>
    </td>
  );
};

export const renderServiceType = ({ project, onUpdateField }: CellRenderProps) => {
  return (
    <td className="px-3 py-1.5">
      <ServiceTypeDropdown
        value={project.serviceType}
        onChange={(value) => onUpdateField(project.id, 'serviceType', value)}
      />
    </td>
  );
};

export const renderCurrentStage = (project: Project) => {
  // 오늘 진행 중인 작업 가져오기
  const todayTasks = React.useMemo(() => {
    try {
      const tasks = mockDataService.getTasksByProjectId(project.id);
      return tasks
        .filter(task => {
          // 오늘이 작업 기간에 포함되는지 확인
          const today = new Date();
          const startDate = new Date(task.startDate);
          const endDate = new Date(task.endDate);
          return today >= startDate && today <= endDate;
        })
        .map(task => task.name || task.title || '')
        .filter(name => name.length > 0);
    } catch (error) {
      return [];
    }
  }, [project.id]);
  
  // 오늘 작업이 있으면 표시, 없으면 기존 currentStage 표시
  const stagesToShow = todayTasks.length > 0 ? todayTasks : project.currentStage;
  
  return (
    <td className="px-3 py-1.5">
      <div className="flex flex-wrap gap-1">
        {stagesToShow.length > 0 ? (
          stagesToShow.map((stage, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200"
            >
              {stage}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </div>
    </td>
  );
};

export const renderStatus = ({ project, onUpdateField }: CellRenderProps) => (
  <td className="px-3 py-1.5">
    <StatusDropdown
      value={project.status}
      onChange={(value) => onUpdateField(project.id, 'status', value)}
    />
  </td>
);

export const renderProgress = (project: Project) => (
  <td className="px-3 py-2.5">
    <ProgressBar progress={project.progress} />
  </td>
);

export const renderClient = ({ project }: CellRenderProps) => (
  <td className="px-3 py-1.5 text-xs text-gray-900 min-w-[110px]" title={project.client}>
    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
      {project.client}
    </div>
  </td>
);

export const renderDate = (field: 'startDate' | 'endDate', { project, editableCell, onUpdateField }: CellRenderProps) => (
  <EditableCell
    project={project}
    field={field}
    type={EditableCellType.DATE}
    editableCell={editableCell}
    onUpdate={onUpdateField}
  />
);

// Separate component to avoid hooks order issues
export const FactoryCell: React.FC<{
  field: 'manufacturer' | 'container' | 'packaging';
  project: Project;
  editableCell: UseEditableCellReturn;
  onUpdateField: (projectId: ProjectId, field: keyof Project, value: Project[keyof Project]) => void;
}> = ({ field, project, editableCell, onUpdateField }) => {
  const [showAddFactory, setShowAddFactory] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const value = project[field];
  const valueString = typeof value === 'string' ? value : '';
  
  // Get factory type label
  const typeLabel = field === 'manufacturer' ? '제조' : field === 'container' ? '용기' : '포장';
  
  // Get factory type from field
  const getFactoryType = (): FactoryType => {
    switch (field) {
      case 'manufacturer': return FactoryType.MANUFACTURING;
      case 'container': return FactoryType.CONTAINER;
      case 'packaging': return FactoryType.PACKAGING;
      default: return FactoryType.MANUFACTURING; // This should never happen due to type constraint
    }
  };
  
  // Get factory data for SearchBox from MockDB
  const factoryData = React.useMemo(() => {
    const factoryType = getFactoryType();
    
    try {
      let factories = mockDataService.getFactoriesByType(factoryType);
      
      const result = factories.map(factory => {
        // Create searchable text from all factory information
        const manager = factory.manager;
        
        const searchableText = [
          factory.name,
          factory.address,
          factory.contactNumber,
          manager?.name,
          manager?.phone,
          manager?.email
        ].filter(Boolean).join(' ');
        
        return {
          id: factory.id,
          name: simplifyCompanyName(factory.name),
          searchableText,
          subText: factory.address || '',
          additionalText: manager ? `담당자: ${manager.name}` : ''
        };
      });
      
      return result;
    } catch (error) {
      return [];
    }
  }, [field]);
  
  // Display mode with pills and + button
  const factories = valueString ? valueString.split(',').map(f => f.trim()).filter(f => f) : [];
  const visibleCount = isExpanded ? factories.length : 2;
  const visibleFactories = factories.slice(0, visibleCount);
  const hiddenCount = factories.length - visibleCount;
  
  return (
    <td className="px-3 py-1.5 min-w-[120px] group">
      <div className="flex items-center gap-1.5 flex-nowrap overflow-hidden">
        {/* Factory pills */}
        {factories.length > 0 ? (
          <>
            {visibleFactories.map((factory, index) => {
              const simplified = simplifyCompanyName(factory);
              // 최소 3자는 보이도록, 너무 길면 말줄임
              const displayName = simplified.length > 5 ? simplified.substring(0, 4) + '..' : simplified;
              
              return (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap"
                  title={factory}
                >
                  {displayName}
                </span>
              );
            })}
            
            {/* Show more/less button */}
            {hiddenCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
                title={isExpanded ? '접기' : `${hiddenCount}개 더 보기`}
              >
                {isExpanded ? '접기' : `+${hiddenCount}`}
              </button>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
        
        {/* Add button */}
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation();
            setShowAddFactory(true);
          }}
          className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-all duration-200"
          title={`${typeLabel} 공장 추가`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      {/* SearchBox dropdown */}
      {showAddFactory && (
        <SearchBox
          isOpen={showAddFactory}
          data={factoryData}
          placeholder={`${typeLabel} 공장 검색...`}
          onSelect={(item) => {
            // Get ID field name (e.g., manufacturer -> manufacturerId)
            const idField = `${field}Id` as keyof Project;
            
            // Update the factory ID field
            const existingIds = project[idField];
            const newId = Array.isArray(existingIds) ? [...existingIds, item.id] : 
                         existingIds ? [existingIds, item.id] : item.id;
            onUpdateField(project.id, idField, newId);
            
            // Update the display name field
            const newValue = valueString ? `${valueString}, ${item.name}` : item.name;
            onUpdateField(project.id, field, newValue);
            setShowAddFactory(false);
          }}
          onClose={() => setShowAddFactory(false)}
          anchorElement={buttonRef.current}
        />
      )}
    </td>
  );
};

export const renderFactory = (field: 'manufacturer' | 'container' | 'packaging', { project, editableCell, onUpdateField }: CellRenderProps) => (
  <FactoryCell 
    field={field}
    project={project}
    editableCell={editableCell}
    onUpdateField={onUpdateField}
  />
);

export const renderCurrency = (field: 'sales' | 'purchase', { project, editableCell, onUpdateField }: CellRenderProps) => (
  <EditableCell
    project={project}
    field={field}
    type={EditableCellType.CURRENCY}
    editableCell={editableCell}
    onUpdate={onUpdateField}
  />
);

// Separate component for checkbox to maintain local state
const DepositPaidCheckbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  onStartDrag?: () => void;
  isDragging?: boolean;
}> = ({ checked, onChange, onStartDrag, isDragging }) => {
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

export const renderPriority = ({ project, onUpdateField }: CellRenderProps) => (
  <td className="px-3 py-1.5">
    <PriorityDropdown 
      value={project.priority}
      onChange={(value) => onUpdateField(project.id, 'priority', value)}
    />
  </td>
);

export const renderDefault = () => (
  <td className="px-3 py-1.5 text-xs text-gray-400">
    -
  </td>
);