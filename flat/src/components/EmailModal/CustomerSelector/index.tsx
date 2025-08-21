import React, { useState } from 'react';
import { Search, X, Users } from 'lucide-react';
import { useCustomers } from '@/shared/hooks/useCustomers';
import './CustomerSelector.css';

interface CustomerSelectorProps {
  selectedCustomers: string[];
  setSelectedCustomers: (customers: string[]) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  selectedCustomers,
  setSelectedCustomers
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { customers } = useCustomers();

  const handleCustomerAdd = (customerId: string) => {
    if (!selectedCustomers.includes(customerId)) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    }
    setSearchQuery('');
  };

  const handleCustomerRemove = (customerId: string) => {
    setSelectedCustomers(selectedCustomers.filter(c => c !== customerId));
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modal-field-spacing">
      <div className="modal-field-label">
        <Users className="w-4 h-4" />
        받는 고객
      </div>
      <div>
        <div className="customer-selector__search-wrapper">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="고객을 검색하세요 (이름, 이메일)"
            className="modal-input pr-8"
          />
          <Search className="customer-selector__search-icon" />
        </div>
        
        {searchQuery.length > 0 && filteredCustomers.length > 0 && (
          <div className="customer-selector__list">
            {filteredCustomers.slice(0, 5).map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleCustomerAdd(customer.id)}
                className="customer-selector__item"
              >
                <span className="customer-selector__name">{customer.name}</span>
                {customer.email && (
                  <span className="customer-selector__email">{customer.email}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 선택된 고객 표시 */}
      {selectedCustomers.length > 0 && (
        <div className="customer-selector__selected">
          <p className="customer-selector__selected-count">{selectedCustomers.length}명 고객 선택됨</p>
          <div className="customer-selector__selected-list">
            {selectedCustomers.map((customerId) => {
              const customer = customers.find(c => c.id === customerId);
              return (
                <div key={customerId} className="customer-selector__tag">
                  <span>{customer?.name || customerId}</span>
                  <button
                    onClick={() => handleCustomerRemove(customerId)}
                    className="customer-selector__tag-remove"
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

export default CustomerSelector;