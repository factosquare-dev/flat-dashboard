import React, { useState, useEffect } from 'react';
import type { User as UserType } from '@/types/user';
import { UserRole } from '@/types/user';
import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';
import { Plus, Search, X } from 'lucide-react';

interface CustomerSelectorProps {
  value?: string;
  onChange: (customerId: string, customerName: string) => void;
  required?: boolean;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({ value, onChange, required = false }) => {
  const [customers, setCustomers] = useState<UserType[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<UserType | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const db = MockDatabaseImpl.getInstance();

  useEffect(() => {
    // Load customers from DB
    const usersResult = db.getAll('users');
    if (usersResult.success && usersResult.data) {
      const users = usersResult.data as UserType[];
      // Customer users are UserRole.CUSTOMER (external customers)
      const customerUsers = users.filter(u => u.role === UserRole.CUSTOMER);
      setCustomers(customerUsers);

      // Set initial selected customer if value is provided
      if (value) {
        const customer = customerUsers.find(c => c.id === value);
        if (customer) {
          setSelectedCustomer(customer);
        }
      }
    }
  }, [value]);

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        // Additional check to make sure we're not clicking on the input or dropdown itself
        if (!target || (target as Element).closest?.('[data-dropdown]') !== dropdownRef.current) {
          setShowSearch(false);
          setSearchQuery('');
        }
      }
    };

    if (showSearch) {
      // Use a slight delay to prevent immediate closure
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside, true);
      }, 0);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }
  }, [showSearch]);

  // Auto focus search input when dropdown opens
  React.useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleSelect = (customer: UserType) => {
    setSelectedCustomer(customer);
    onChange(customer.id, customer.name);
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleRemove = () => {
    setSelectedCustomer(null);
    onChange('', '');
  };

  const filteredCustomers = customers.filter(c => {
    const nameMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const companyMatch = c.company?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || companyMatch;
  });

  // Debug logging
  console.log('CustomerSelector Debug:', {
    customers: customers.length,
    searchQuery,
    filteredCustomers: filteredCustomers.length,
    showSearch
  });

  const renderCustomerItem = (customer: UserType) => (
    <>
      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold text-white">
        {customer.name.charAt(0)}
      </div>
      <div className="flex-1 text-left">
        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
        {customer.company && (
          <div className="text-xs text-gray-500">{customer.company}</div>
        )}
      </div>
    </>
  );

  const renderSelectedCustomer = (customer: UserType) => (
    <>
      <div className="w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
        {customer.name.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
        {customer.company && (
          <div className="text-xs text-gray-500">{customer.company}</div>
        )}
      </div>
    </>
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        고객 {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative" ref={dropdownRef} data-dropdown="customer">
        {/* Selected Customer Display */}
        {selectedCustomer && (
          <div className="flex items-center gap-2 p-3 bg-white border border-gray-300 rounded-md mb-3">
            <div className="w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {selectedCustomer.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{selectedCustomer.name}</div>
              {selectedCustomer.company && (
                <div className="text-xs text-gray-500">{selectedCustomer.company}</div>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
            </button>
          </div>
        )}

        {/* Add Customer Button */}
        {!selectedCustomer && (
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">고객 추가</span>
          </button>
        )}

        {/* Search Dropdown */}
        {showSearch && (
          <div 
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div 
              className="p-2 border-b border-gray-200" 
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="검색..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Options List */}
            <div 
              className="max-h-60 overflow-y-auto"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => e.stopPropagation()}
            >
              {filteredCustomers.length > 0 ? (
                <div className="py-1">
                  {filteredCustomers.map(customer => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(customer);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold text-white">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        {customer.company && (
                          <div className="text-xs text-gray-500">{customer.company}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSelector;