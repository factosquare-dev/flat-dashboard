import React, { useState, useEffect, useRef } from 'react';
import { UserPlus } from 'lucide-react';
import type { User as UserType } from '@/shared/types/user';
import { UserRole, InternalManagerType } from '@/shared/types/user';
import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import { BaseSelector, type SelectorOption } from './shared/BaseSelector';

interface ManagerSelectorProps {
  value?: string;
  onChange: (managerIds: string, managerNames: string) => void;
}

interface SelectedManagers {
  sales: UserType[];
  content: UserType[];
  container: UserType[];
  qa: UserType[];
}

type ManagerType = keyof SelectedManagers;

const ManagerSelector: React.FC<ManagerSelectorProps> = ({ value, onChange }) => {
  const isInitialized = useRef(false);
  const [managers, setManagers] = useState<SelectedManagers>({
    sales: [],
    content: [],
    container: [],
    qa: []
  });

  const [selectedManagers, setSelectedManagers] = useState<SelectedManagers>({
    sales: [],
    content: [],
    container: [],
    qa: []
  });

  const db = MockDatabaseImpl.getInstance();

  const managerTypeLabels: Record<ManagerType, string> = {
    sales: '영업 담당',
    content: '내용물 담당',
    container: '용기 담당',
    qa: 'QA/RA 담당'
  };

  // Load managers from DB once
  useEffect(() => {
    const loadManagers = async () => {
      try {
        const usersResult = await db.getAll('users');
        if (usersResult.success && usersResult.data) {
          const users = usersResult.data as UserType[];
          console.log('Total users:', users.length);
          
          // Manager users are UserRole.INTERNAL_MANAGER
          const managerUsers = users.filter(u => u.role === UserRole.INTERNAL_MANAGER);
          console.log('Manager users:', managerUsers.length);
          console.log('Manager users details:', managerUsers.map(u => ({ id: u.id, name: u.name, type: u.internalManagerType })));
          
          // Categorize managers by their specialization
          const categorizedManagers: SelectedManagers = {
            sales: managerUsers.filter(m => m.internalManagerType === InternalManagerType.SALES),
            content: managerUsers.filter(m => m.internalManagerType === InternalManagerType.CONTENT),
            container: managerUsers.filter(m => m.internalManagerType === InternalManagerType.CONTAINER),
            qa: managerUsers.filter(m => m.internalManagerType === InternalManagerType.QA || m.internalManagerType === InternalManagerType.RA)
          };
          
          console.log('Categorized managers:', categorizedManagers);
          console.log('Sales managers:', categorizedManagers.sales.length);
          console.log('Content managers:', categorizedManagers.content.length);
          console.log('Container managers:', categorizedManagers.container.length);
          console.log('QA managers:', categorizedManagers.qa.length);
          
          setManagers(categorizedManagers);
        } else {
          console.error('Failed to load users from database:', usersResult);
        }
      } catch (error) {
        console.error('Error loading managers:', error);
      }
    };

    loadManagers();
  }, []); // Only run once on mount

  // Handle value changes separately
  useEffect(() => {
    if (value && value !== 'undefined' && managers.sales.length > 0) {
      try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object') {
          const initialSelected: SelectedManagers = {
            sales: [],
            content: [],
            container: [],
            qa: []
          };

          Object.keys(parsed).forEach(type => {
            if (type in initialSelected && Array.isArray(parsed[type])) {
              initialSelected[type as ManagerType] = parsed[type].map((id: string) => 
                managers[type as ManagerType].find(manager => manager.id === id)
              ).filter(Boolean);
            }
          });

          setSelectedManagers(initialSelected);
        }
      } catch (error) {
        console.warn('Failed to parse manager value:', error);
      }
    }
  }, [value, managers]); // React to value and managers changes

  // Remove the useEffect that calls onChange automatically
  // onChange will be called only when user makes selections in handleManagerTypeSelectionChange

  const handleManagerTypeSelectionChange = (managerType: ManagerType) => 
    (selectedOptions: SelectorOption[]) => {
      const selectedUsers = selectedOptions.map(option => 
        managers[managerType].find(manager => manager.id === option.id)
      ).filter(Boolean) as UserType[];

      const updatedSelectedManagers = {
        ...selectedManagers,
        [managerType]: selectedUsers
      };

      setSelectedManagers(updatedSelectedManagers);

      // Call onChange with updated data
      const managerData: Record<string, string[]> = {};
      const managerNames: Record<string, string[]> = {};
      
      Object.entries(updatedSelectedManagers).forEach(([type, managers]) => {
        if (managers.length > 0) {
          managerData[type] = managers.map(m => m.id);
          managerNames[type] = managers.map(m => m.name);
        }
      });

      const ids = JSON.stringify(managerData);
      const names = JSON.stringify(managerNames);
      onChange(ids, names);
    };

  const renderManagerOption = (option: SelectorOption) => (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-semibold text-white">
        {option.name.charAt(0)}
      </div>
      <span className="text-sm font-medium">{option.name}</span>
    </div>
  );

  const renderSelectedManagerItem = (option: SelectorOption, onRemove: () => void) => (
    <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-xs font-semibold text-white">
        {option.name.charAt(0)}
      </div>
      <span>{option.name}</span>
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 rounded-full p-0.5 ml-1"
      >
        ×
      </button>
    </div>
  );

  return (
    <div className="w-full space-y-4">
      {(Object.keys(managers) as ManagerType[]).map(managerType => {
        const typeManagers = managers[managerType];
        const selectedTypeManagers = selectedManagers[managerType];
        
        if (typeManagers.length === 0) return null;

        const options: SelectorOption[] = typeManagers.map(manager => ({
          id: manager.id,
          name: manager.name,
        }));

        const selectedOptions: SelectorOption[] = selectedTypeManagers.map(manager => ({
          id: manager.id,
          name: manager.name,
        }));

        return (
          <div key={managerType} className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {managerTypeLabels[managerType]}
            </label>
            <BaseSelector
              options={options}
              selectedOptions={selectedOptions}
              onSelectionChange={handleManagerTypeSelectionChange(managerType)}
              placeholder={`${managerTypeLabels[managerType]}를 선택하세요`}
              searchPlaceholder="담당자명으로 검색..."
              multiSelect={true}
              renderOption={renderManagerOption}
              renderSelectedItem={renderSelectedManagerItem}
              addNewText="새 담당자 추가"
              onAddNew={() => {
                // TODO: Open manager creation modal
                console.log(`Add new ${managerType} manager`);
              }}
              className="w-full"
            />
          </div>
        );
      })}
    </div>
  );
};

export default ManagerSelector;