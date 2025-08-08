import React, { useState } from 'react';
import { Search, X, User } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import './ManagerSelector.css';

interface ManagerSelectorProps {
  selectedManagers: string[];
  setSelectedManagers: (managers: string[]) => void;
}

const ManagerSelector: React.FC<ManagerSelectorProps> = ({
  selectedManagers,
  setSelectedManagers
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { users } = useUsers();
  
  // Filter only managers (or all users if no role distinction)
  const managers = users.filter(user => 
    user.role === 'manager' || user.role === 'admin' || true // Show all users for now
  );

  const handleManagerAdd = (managerId: string) => {
    if (!selectedManagers.includes(managerId)) {
      setSelectedManagers([...selectedManagers, managerId]);
    }
    setSearchQuery('');
  };

  const handleManagerRemove = (managerId: string) => {
    setSelectedManagers(selectedManagers.filter(m => m !== managerId));
  };

  const filteredManagers = managers.filter(manager =>
    manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modal-field-spacing">
      <div className="modal-field-label">
        <User className="w-4 h-4" />
        담당자 (팩토)
      </div>
      <div>
        <div className="manager-selector__search-wrapper">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="담당자를 검색하세요 (이름, 이메일, 부서)"
            className="modal-input pr-8"
          />
          <Search className="manager-selector__search-icon" />
        </div>
        
        {searchQuery.length > 0 && filteredManagers.length > 0 && (
          <div className="manager-selector__list">
            {filteredManagers.slice(0, 5).map((manager) => (
              <button
                key={manager.id}
                onClick={() => handleManagerAdd(manager.id)}
                className="manager-selector__item"
              >
                <div className="manager-selector__info">
                  <span className="manager-selector__name">{manager.name}</span>
                  {manager.department && (
                    <span className="manager-selector__department">{manager.department}</span>
                  )}
                </div>
                {manager.email && (
                  <span className="manager-selector__email">{manager.email}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 선택된 담당자 표시 */}
      {selectedManagers.length > 0 && (
        <div className="manager-selector__selected">
          <p className="manager-selector__selected-count">{selectedManagers.length}명 담당자 선택됨</p>
          <div className="manager-selector__selected-list">
            {selectedManagers.map((managerId) => {
              const manager = managers.find(m => m.id === managerId);
              return (
                <div key={managerId} className="manager-selector__tag">
                  <span>{manager?.name || managerId}</span>
                  {manager?.department && (
                    <span className="manager-selector__tag-dept">({manager.department})</span>
                  )}
                  <button
                    onClick={() => handleManagerRemove(managerId)}
                    className="manager-selector__tag-remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerSelector;