import React, { useState, useEffect } from 'react';
import type { User as UserType } from '@/shared/types/user';
import { UserRole } from '@/shared/types/user';
import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import { BaseSelector, type SelectorOption } from './shared/BaseSelector';

interface CustomerSelectorProps {
  value?: string;
  onChange: (customerId: string, customerName: string) => void;
  required?: boolean;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({ value, onChange, required = false }) => {
  const [customers, setCustomers] = useState<UserType[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<SelectorOption[]>([]);

  const db = MockDatabaseImpl.getInstance();

  useEffect(() => {
    // Load customers from DB
    const loadCustomers = () => {
      try {
        const usersResult = db.getAll('users');
        if (usersResult.success && usersResult.data) {
          const users = usersResult.data as UserType[];
          // Customer users are UserRole.CUSTOMER (external customers)
          const customerUsers = users.filter(u => u.role === UserRole.CUSTOMER);
          
          // If no customers found, try to get all users with company info
          if (customerUsers.length === 0) {
            // Fallback: get all users who have company info
            const usersWithCompany = users.filter(u => u.company && u.company !== '');
            setCustomers(usersWithCompany);
          } else {
            setCustomers(customerUsers);
          }

          // Set initial selected customer if value is provided
          if (value) {
            const allAvailableUsers = customerUsers.length > 0 ? customerUsers : users.filter(u => u.company);
            const customer = allAvailableUsers.find(c => c.id === value);
            if (customer) {
              setSelectedOptions([{
                id: customer.id,
                name: customer.name,
                company: customer.company
              }]);
            }
          }
        }
      } catch (error) {
        // If DB is not ready, retry after a short delay
        setTimeout(loadCustomers, 100);
      }
    };
    
    loadCustomers();
  }, [value, db]);

  // Convert customers to selector options
  const options: SelectorOption[] = customers.map(customer => ({
    id: customer.id,
    name: customer.name,
    company: customer.company
  }));

  const handleSelectionChange = (options: SelectorOption[]) => {
    setSelectedOptions(options);
    if (options.length > 0) {
      const selected = options[0];
      onChange(selected.id, selected.name);
    } else {
      onChange('', '');
    }
  };

  const renderOption = (option: SelectorOption) => (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold text-white">
        {option.name.charAt(0)}
      </div>
      <div className="flex-1 text-left">
        <div className="text-sm font-medium text-gray-900">{option.name}</div>
        {option.company && (
          <div className="text-xs text-gray-500">{option.company}</div>
        )}
      </div>
    </div>
  );

  const renderSelectedItem = (option: SelectorOption, onRemove: () => void) => (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold text-white">
          {option.name.charAt(0)}
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-gray-900">{option.name}</div>
          {option.company && (
            <div className="text-xs text-gray-500">{option.company}</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <BaseSelector
      options={options}
      selectedOptions={selectedOptions}
      onSelectionChange={handleSelectionChange}
      placeholder="고객을 선택하세요"
      searchPlaceholder="고객명 또는 회사명으로 검색..."
      multiSelect={false}
      required={required}
      renderOption={renderOption}
      renderSelectedItem={renderSelectedItem}
      className="w-full"
    />
  );
};

export default CustomerSelector;