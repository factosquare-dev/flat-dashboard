import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import type { UseEditableCellReturn } from '@/hooks/useEditableCell';
import { FactoryType } from '@/types/enums';
import { mockDataService } from '@/services/mockDataService';
import { simplifyCompanyName } from '@/utils/coreUtils';
import SearchBox from '../../SearchBox';

interface FactoryCellProps {
  field: 'manufacturer' | 'container' | 'packaging';
  project: Project;
  editableCell: UseEditableCellReturn;
  onUpdateField: (projectId: ProjectId, field: keyof Project, value: Project[keyof Project]) => void;
}

export const FactoryCell: React.FC<FactoryCellProps> = ({ field, project, editableCell, onUpdateField }) => {
  const [showAddFactory, setShowAddFactory] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const value = project[field];
  const idField = `${field}Id` as keyof Project;
  const factoryIds = project[idField];
  
  // Get factory type from field
  const getFactoryType = (): FactoryType => {
    switch (field) {
      case 'manufacturer': return FactoryType.MANUFACTURING;
      case 'container': return FactoryType.CONTAINER;
      case 'packaging': return FactoryType.PACKAGING;
      default: return FactoryType.MANUFACTURING;
    }
  };
  
  // Get factory names - use value if it has names, otherwise convert IDs
  const factories = React.useMemo(() => {
    // First try to use the value (which should contain names)
    if (value) {
      if (Array.isArray(value)) {
        // Check if the values are IDs (e.g., 'mfg-1') or names
        const firstValue = value[0];
        if (firstValue && firstValue.match(/^(mfg|cont|pack)-\d+$/)) {
          // These are IDs, convert them
          const factoryType = getFactoryType();
          const factoriesData = mockDataService.getFactoriesByType(factoryType);
          return value.map(id => {
            const factory = factoriesData.find(f => f.id === id);
            return factory ? simplifyCompanyName(factory.name) : id;
          });
        }
        // These are already names
        return value;
      }
      if (typeof value === 'string') {
        return value.split(',').map(f => f.trim()).filter(f => f);
      }
    }
    
    // Fallback: use factory IDs
    if (!factoryIds) return [];
    
    const factoryType = getFactoryType();
    const factoriesData = mockDataService.getFactoriesByType(factoryType);
    
    if (Array.isArray(factoryIds)) {
      return factoryIds.map(id => {
        const factory = factoriesData.find(f => f.id === id);
        return factory ? simplifyCompanyName(factory.name) : id;
      });
    } else {
      const factory = factoriesData.find(f => f.id === factoryIds);
      return factory ? [simplifyCompanyName(factory.name)] : [factoryIds];
    }
  }, [value, factoryIds, field]);
  
  // Get factory type label
  const typeLabel = field === 'manufacturer' ? '제조' : field === 'container' ? '용기' : '포장';
  
  // Get factory data for SearchBox from MockDB
  const factoryData = React.useMemo(() => {
    const factoryType = getFactoryType();
    
    try {
      let allFactories = mockDataService.getFactoriesByType(factoryType);
      
      // Filter out already added factories
      const existingFactoryIds = Array.isArray(factoryIds) ? factoryIds : factoryIds ? [factoryIds] : [];
      const availableFactories = allFactories.filter(factory => !existingFactoryIds.includes(factory.id));
      
      const result = availableFactories.map(factory => {
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
  }, [field, factoryIds]);
  
  // Display mode with pills and + button
  const visibleCount = isExpanded ? factories.length : 2;
  const visibleFactories = factories.slice(0, visibleCount);
  const hiddenCount = factories.length - visibleCount;
  
  return (
    <td className="px-3 py-1.5 min-w-[120px] group">
      <div className="flex items-center gap-1.5 flex-nowrap overflow-hidden">
        {/* Factory pills */}
        {visibleFactories.map((factory, index) => {
          // factory는 이미 simplifyCompanyName이 적용된 상태
          // 최소 3자는 보이도록, 너무 길면 말줄임
          const displayName = factory.length > 5 ? factory.substring(0, 4) + '..' : factory;
          
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
            
            // Check if already exists (double check for safety)
            const existingIds = project[idField];
            const currentIds = Array.isArray(existingIds) ? existingIds : existingIds ? [existingIds] : [];
            
            if (currentIds.includes(item.id)) {
              console.warn(`Factory ${item.id} already added`);
              setShowAddFactory(false);
              return;
            }
            
            // Update the factory ID field only
            // The name will be automatically updated in useProjectData
            const newIds = [...currentIds, item.id];
            onUpdateField(project.id, idField, newIds);
            setShowAddFactory(false);
          }}
          onClose={() => setShowAddFactory(false)}
          anchorElement={buttonRef.current}
        />
      )}
    </td>
  );
};