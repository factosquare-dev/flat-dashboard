import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import type { UseEditableCellReturn } from '@/hooks/useEditableCell';
import { FactoryType, ProjectType, ProjectFactoryField, ProjectFactoryIdField, FactoryFieldToType, FactoryTypeLabel } from '@/types/enums';
import { mockDataService } from '@/services/mockDataService';
import { formatManufacturerDisplay } from '@/utils/companyUtils';
import { isProjectType } from '@/utils/projectTypeUtils';
import SearchBox from '@/features/projects/components/SearchBox';
import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';

interface FactoryCellProps {
  field: ProjectFactoryField;
  project: Project;
  editableCell: UseEditableCellReturn;
  onUpdateField: (projectId: ProjectId, field: keyof Project, value: Project[keyof Project]) => void;
}

export const FactoryCell: React.FC<FactoryCellProps> = ({ field, project, editableCell, onUpdateField }) => {
  const [showAddFactory, setShowAddFactory] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  // Map field to the correct name field
  const nameField = `${field}Name` as keyof Project; // e.g., manufacturerName
  const idField = `${field}Id` as keyof Project; // e.g., manufacturerId
  const value = project[nameField]; // Use the name field, not the base field
  
  // Get factory type from field using enum mapping
  const getFactoryType = (): FactoryType => {
    return FactoryFieldToType[field];
  };
  
  // For Master projects, get factory IDs from SUB projects
  const factoryIds = React.useMemo(() => {
    if (isProjectType(project.type, ProjectType.MASTER)) {
      // Get SUB projects from MockDB
      const db = MockDatabaseImpl.getInstance();
      if (!db) return [];
      
      const allProjects = Array.from(db.getDatabase().projects.values());
      const subProjects = allProjects.filter(p => 
        p.type === ProjectType.SUB && p.parentId === project.id
      );
      
      // Collect factory IDs from SUB projects
      const collectedIds = new Set<string>();
      
      subProjects.forEach(sub => {
        const subIds = sub[idField];
        if (subIds) {
          if (Array.isArray(subIds)) {
            subIds.forEach(id => collectedIds.add(id));
          } else {
            collectedIds.add(subIds);
          }
        }
      });
      
      return Array.from(collectedIds);
    }
    
    // For non-Master projects, use the stored IDs
    return project[idField];
  }, [project, idField, field]);
  
  // Get original factory names for tooltip
  const originalFactoryNames = React.useMemo(() => {
    if (value) {
      if (Array.isArray(value)) {
        const firstValue = value[0];
        if (firstValue && firstValue.match(/^(mfg|cont|pack)-\d+$/)) {
          const factoryType = getFactoryType();
          const factoriesData = mockDataService.getFactoriesByType(factoryType);
          return value.map(id => {
            const factory = factoriesData.find(f => f.id === id);
            return factory ? factory.name : id;
          });
        }
        return value;
      }
      if (typeof value === 'string') {
        return value.split(',').map(f => f.trim()).filter(f => f);
      }
    }
    
    if (!factoryIds) return [];
    
    const factoryType = getFactoryType();
    const factoriesData = mockDataService.getFactoriesByType(factoryType);
    
    if (Array.isArray(factoryIds)) {
      return factoryIds.map(id => {
        const factory = factoriesData.find(f => f.id === id);
        return factory ? factory.name : id;
      });
    } else {
      const factory = factoriesData.find(f => f.id === factoryIds);
      return factory ? [factory.name] : [factoryIds];
    }
  }, [value, factoryIds, field]);
  
  // Get factory names - use value if it has names, otherwise convert IDs
  const factories = React.useMemo(() => {
    // Use the name value directly if available
    if (value) {
      if (Array.isArray(value)) {
        return value.map(name => formatManufacturerDisplay(name));
      }
      if (typeof value === 'string') {
        return value.split(',').map(f => f.trim()).filter(f => f).map(name => formatManufacturerDisplay(name));
      }
    }
    
    // If no name value, convert IDs to names
    if (!factoryIds) return [];
    
    const factoryType = getFactoryType();
    const factoriesData = mockDataService.getFactoriesByType(factoryType);
    
    if (Array.isArray(factoryIds)) {
      return factoryIds.map(id => {
        const factory = factoriesData.find(f => f.id === id);
        return factory ? formatManufacturerDisplay(factory.name) : '';
      }).filter(Boolean);
    } else {
      const factory = factoriesData.find(f => f.id === factoryIds);
      return factory ? [formatManufacturerDisplay(factory.name)] : [];
    }
  }, [value, factoryIds, field]);
  
  // Get factory type label using enum
  const typeLabel = FactoryTypeLabel[getFactoryType()];
  
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
          factory.name, // 원본 이름으로 검색 가능
          formatManufacturerDisplay(factory.name), // 축약된 이름으로도 검색 가능
          factory.address,
          factory.contactNumber,
          manager?.name,
          manager?.phone,
          manager?.email
        ].filter(Boolean).join(' ');
        
        return {
          id: factory.id,
          name: factory.name, // SearchBox에서는 원본 이름 표시
          originalName: factory.name, // 툴팁용 원본 이름
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
  
  // Master 프로젝트는 공장 정보를 편집할 수 없음 (SUB에서 집계된 정보 표시)
  const isMaster = isProjectType(project.type, ProjectType.MASTER);
  
  return (
    <td className="px-3 py-1.5 min-w-[120px] group">
      <div className="flex items-center gap-1.5 flex-nowrap overflow-hidden">
        {/* Factory pills */}
        {visibleFactories.map((factory, index) => {
          // factory는 이미 formatManufacturerDisplay가 적용된 상태
          // 최소 3자는 보이도록, 너무 길면 말줄임
          const displayName = factory.length > 5 ? factory.substring(0, 3) + '..' : factory;
          const originalName = originalFactoryNames[index] || factory;
          
          return (
            <span
              key={index}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                isMaster 
                  ? 'bg-gray-50 text-gray-500 border border-gray-100' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
              title={originalName}
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
        
        {/* Add button - Master 프로젝트에서는 숨김 */}
        {!isMaster && (
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
        )}
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
            let currentIds = Array.isArray(existingIds) ? existingIds : existingIds ? [existingIds] : [];
            
            // 중첩 배열 감지 및 평탄화
            if (currentIds.length === 1 && Array.isArray(currentIds[0])) {
              currentIds = currentIds[0];
            }
            
            if (currentIds.includes(item.id)) {
              setShowAddFactory(false);
              return;
            }
            
            // Update both ID and name fields
            const newIds = [...new Set([...currentIds, item.id])];
            onUpdateField(project.id, idField, newIds);
            
            // Also update the name field
            const currentNames = value ? (Array.isArray(value) ? value : [value]) : [];
            const newNames = [...currentNames, item.name];
            onUpdateField(project.id, nameField, newNames);
            
            setShowAddFactory(false);
          }}
          onClose={() => setShowAddFactory(false)}
          anchorElement={buttonRef.current}
        />
      )}
    </td>
  );
};