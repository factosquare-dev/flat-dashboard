import React, { useState, useRef, useEffect } from 'react';
import type { Project } from '@/shared/types/project';
import type { Customer } from '@/shared/types/customer';
import SearchBox from './SearchBox';
import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import { factories } from '@/core/database/factories';
import { FactoryType, FactoryTypeLabel } from '@/shared/types/enums';

interface SearchableCellProps {
  project: Project;
  field: 'client' | 'manufacturer' | 'container' | 'packaging';
  onUpdate: (projectId: string, field: keyof Project, value: string) => void;
}

const SearchableCell: React.FC<SearchableCellProps> = ({ project, field, onUpdate }) => {
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const cellRef = useRef<HTMLTableCellElement>(null);

  // Load customer data from mock database
  useEffect(() => {
    if (field === 'client') {
      const db = MockDatabaseImpl.getInstance();
      const database = db.getDatabase();
      const customers = Array.from(database.customers.values());
      setCustomerData(customers);
    }
  }, [field]);

  // 필드에 따라 다른 데이터와 설정 사용
  const getSearchConfig = () => {
    if (field === 'client') {
      return {
        data: customerData.map(c => ({
          id: c.id,
          name: c.name,
          subText: `${c.contactPerson} - ${c.companyName}`,
          searchableText: `${c.name} ${c.companyName} ${c.contactPerson}`
        })),
        placeholder: '고객 검색...',
        displayField: 'name' as const
      };
    } else {
      const typeMap = {
        manufacturer: FactoryType.MANUFACTURING,
        container: FactoryType.CONTAINER,
        packaging: FactoryType.PACKAGING
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
        placeholder: `${FactoryTypeLabel[factoryType]} 공장 검색...`,
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