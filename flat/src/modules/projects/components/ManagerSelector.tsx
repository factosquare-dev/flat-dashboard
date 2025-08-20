import React, { useState, useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';
import type { User as UserType } from '@/shared/types/user';
import { UserRole, InternalManagerType } from '@/shared/types/user';
import { MockDatabaseImpl } from '@/core/database/MockDatabase';

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

  const [showSearch, setShowSearch] = useState<ManagerType | null>(null);
  const dropdownRefs = React.useRef<{ [key in ManagerType]?: HTMLDivElement }>({});

  const db = MockDatabaseImpl.getInstance();

  const managerTypeLabels: Record<ManagerType, string> = {
    sales: '영업 담당',
    content: '내용물 담당',
    container: '용기 담당',
    qa: 'QA/RA 담당'
  };

  useEffect(() => {
    // Load managers from DB
    const usersResult = db.getAll('users');
    if (usersResult.success && usersResult.data) {
      const users = usersResult.data as UserType[];
      const internalManagers = users.filter(u => u.role === UserRole.INTERNAL_MANAGER);

      setManagers({
        sales: internalManagers.filter(u => u.internalManagerType === InternalManagerType.SALES),
        content: internalManagers.filter(u => u.internalManagerType === InternalManagerType.CONTENT),
        container: internalManagers.filter(u => u.internalManagerType === InternalManagerType.CONTAINER),
        qa: internalManagers.filter(u =>
          u.internalManagerType === InternalManagerType.QA ||
          u.internalManagerType === InternalManagerType.RA
        )
      });

      // Set initial selected managers if value is provided
      if (value) {
        const managerIds = value.split(',');
        const selected: SelectedManagers = { sales: [], content: [], container: [], qa: [] };

        managerIds.forEach(id => {
          const manager = users.find(u => u.id === id);
          if (manager && manager.role === UserRole.INTERNAL_MANAGER) {
            if (manager.internalManagerType === InternalManagerType.SALES) {
              selected.sales.push(manager);
            } else if (manager.internalManagerType === InternalManagerType.CONTENT) {
              selected.content.push(manager);
            } else if (manager.internalManagerType === InternalManagerType.CONTAINER) {
              selected.container.push(manager);
            } else if (manager.internalManagerType === InternalManagerType.QA || 
                       manager.internalManagerType === InternalManagerType.RA) {
              selected.qa.push(manager);
            }
          }
        });

        setSelectedManagers(selected);
      }
    }
  }, [value]);

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSearch) {
        const currentRef = dropdownRefs.current[showSearch];
        if (currentRef && !currentRef.contains(event.target as Node)) {
          setShowSearch(null);
        }
      }
    };

    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch]);

  const handleSelect = (type: ManagerType, manager: UserType) => {
    const exists = selectedManagers[type].find(m => m.id === manager.id);
    if (!exists) {
      const updated = {
        ...selectedManagers,
        [type]: [...selectedManagers[type], manager]
      };
      setSelectedManagers(updated);
      updateFormData(updated);
    }
    setShowSearch(null);
  };

  const handleRemove = (type: ManagerType, managerId: string) => {
    const updated = {
      ...selectedManagers,
      [type]: selectedManagers[type].filter(m => m.id !== managerId)
    };
    setSelectedManagers(updated);
    updateFormData(updated);
  };

  const updateFormData = (managers: SelectedManagers) => {
    const allManagers = Object.values(managers).flat();
    onChange(
      allManagers.map(m => m.id).join(','),
      allManagers.map(m => m.name).join(', ')
    );
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* All manager types in a simple 4-column grid */}
      {(Object.keys(managerTypeLabels) as ManagerType[]).map(type => (
        <div key={type} className="space-y-2" ref={(el) => { if (el) dropdownRefs.current[type] = el; }}>
          <label className="block text-xs font-medium text-gray-700">
            {managerTypeLabels[type]}
          </label>
          
          {/* Selected Managers Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-2 min-h-[80px]">
            {selectedManagers[type].length > 0 ? (
              <div className="space-y-1">
                {selectedManagers[type].map(manager => (
                  <div
                    key={manager.id}
                    className="flex items-center justify-between bg-white px-2 py-1 rounded text-xs"
                  >
                    <span className="text-gray-900 truncate">{manager.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(type, manager.id)}
                      className="ml-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center pt-6">
                미배정
              </div>
            )}
          </div>

          {/* Add Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSearch(showSearch === type ? null : type)}
              className="w-full flex items-center justify-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition-colors text-xs"
            >
              <UserPlus className="w-3 h-3" />
              <span>추가</span>
            </button>

            {/* Dropdown */}
            {showSearch === type && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {managers[type].length > 0 ? (
                  <div className="py-1" onClick={(e) => e.stopPropagation()}>
                    {managers[type].map(manager => {
                      const isSelected = selectedManagers[type].some(m => m.id === manager.id);
                      return (
                        <button
                          key={manager.id}
                          type="button"
                          onClick={() => !isSelected && handleSelect(type, manager)}
                          disabled={isSelected}
                          className={`w-full px-2 py-1.5 text-left hover:bg-gray-50 ${
                            isSelected ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                          }`}
                        >
                          <div className="text-xs text-gray-900">{manager.name}</div>
                          <div className="text-xs text-gray-500">{manager.email}</div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-3 text-xs text-gray-500 text-center">
                    등록된 담당자가 없습니다
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ManagerSelector;