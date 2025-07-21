import React, { useState, useRef } from 'react';
import type { Project } from '../../../types/project';
import SearchBox from './SearchBox';
import { customerContacts } from '../../../data/mockData';
import { factories } from '../../../data/factories';

interface SearchableCellProps {
  project: Project;
  field: 'client' | 'manufacturer' | 'container' | 'packaging';
  onUpdate: (projectId: string, field: keyof Project, value: any) => void;
}

const SearchableCell: React.FC<SearchableCellProps> = ({ project, field, onUpdate }) => {
  const [showSearchBox, setShowSearchBox] = useState(false);
  const cellRef = useRef<HTMLTableCellElement>(null);

  // 필드에 따라 다른 데이터와 설정 사용
  const getSearchConfig = () => {
    if (field === 'client') {
      return {
        data: customerContacts.map(c => ({
          id: c.id,
          name: c.company,
          subText: `${c.name} (${c.position})`,
          searchableText: `${c.company} ${c.name} ${c.position}`
        })),
        placeholder: '고객 검색...',
        displayField: 'name' as const
      };
    } else {
      const typeMap = {
        manufacturer: '제조',
        container: '용기',
        packaging: '포장'
      };
      const factoryType = typeMap[field];
      const filteredFactories = factories.filter(f => f.type === factoryType);
      
      return {
        data: filteredFactories.map(f => ({
          id: f.id,
          name: f.name,
          subText: f.address,
          additionalText: f.certifications?.slice(0, 3).join(', '),
          searchableText: `${f.name} ${f.address} ${f.email}`
        })),
        placeholder: `${factoryType} 공장 검색...`,
        displayField: 'name' as const
      };
    }
  };

  const config = getSearchConfig();

  return (
    <>
      <td 
        ref={cellRef}
        className="px-2 py-2 text-xs text-gray-700 cursor-pointer group hover:bg-gray-50"
        onClick={(e) => {
          e.stopPropagation();
          setShowSearchBox(true);
        }}
      >
        <div className="relative">
          <div className="truncate max-w-[140px] group-hover:text-gray-900 transition-colors" title={project[field]}>
            {project[field]}
          </div>
        </div>
      </td>
      <SearchBox
        isOpen={showSearchBox}
        onClose={() => setShowSearchBox(false)}
        onSelect={(item) => {
          onUpdate(project.id, field, item.name);
        }}
        anchorElement={cellRef.current}
        data={config.data}
        placeholder={config.placeholder}
      />
    </>
  );
};

export default SearchableCell;