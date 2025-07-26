import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, RefreshCw, Building2, Edit2, Trash2, Eye, MoreVertical } from 'lucide-react';
import PageLayout from '@/components/common/PageLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui';
import CustomerModal from '@/components/CustomerModal';
import type { Customer } from '@/types/customer';
import { formatDate } from '@/utils/dateUtils';
import { useToast } from '@/hooks/useToast';
import { customerService } from '@/mocks/services';
import { LoadingState } from '@/components/loading/LoadingState';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Load customers
  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await customerService.getAll();
      if (result.success && result.data) {
        setCustomers(result.data);
        setFilteredCustomers(result.data);
      } else {
        throw new Error(result.error || '고객 정보를 불러오는데 실패했습니다');
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : '고객 정보를 불러오는데 실패했습니다';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Search customers
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.companyName.toLowerCase().includes(query) ||
        customer.contactPerson.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);

  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('정말로 이 고객을 삭제하시겠습니까?')) {
      try {
        const result = await customerService.deactivate(customerId);
        if (result.success) {
          await loadCustomers();
          showToast('고객이 삭제되었습니다', 'success');
        } else {
          throw new Error(result.error || '고객 삭제에 실패했습니다');
        }
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : '고객 삭제에 실패했습니다';
        showToast(errorMessage, 'error');
      }
    }
  };

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    try {
      if (modalMode === 'create') {
        const result = await customerService.create(customerData, 'current-user');
        if (result.success) {
          await loadCustomers();
          showToast('고객이 등록되었습니다', 'success');
        } else {
          throw new Error(result.error || '고객 등록에 실패했습니다');
        }
      } else if (modalMode === 'edit' && selectedCustomer) {
        const result = await customerService.update(selectedCustomer.id, customerData);
        if (result.success) {
          await loadCustomers();
          showToast('고객 정보가 수정되었습니다', 'success');
        } else {
          throw new Error(result.error || '고객 수정에 실패했습니다');
        }
      }
      setShowModal(false);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : '저장에 실패했습니다';
      showToast(errorMessage, 'error');
    }
  };

  return (
    <PageLayout
      title="고객 관리"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCustomers}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button
            size="sm"
            onClick={handleCreateCustomer}
          >
            <Plus className="w-4 h-4" />
            고객 등록
          </Button>
        </div>
      }
    >
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="고객명, 회사명, 담당자, 이메일로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Customers Table */}
      <LoadingState
        isLoading={isLoading}
        error={null}
        isEmpty={filteredCustomers.length === 0}
        emptyComponent={
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">고객이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? '검색 결과가 없습니다' : '새로운 고객을 등록해주세요'}
              </p>
            </div>
          </div>
        }
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  담당자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  연락처
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  업종
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.companyName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.contactPerson}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.contactNumber}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.industry || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(customer.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewCustomer(customer)}
                        className="text-gray-400 hover:text-gray-600"
                        title="상세보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="text-blue-600 hover:text-blue-900"
                        title="수정"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-900"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </LoadingState>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveCustomer}
        editData={selectedCustomer}
        mode={modalMode}
      />
    </PageLayout>
  );
};

export default CustomersPage;