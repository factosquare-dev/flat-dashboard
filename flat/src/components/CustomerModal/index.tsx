import React, { useState, useEffect, useCallback } from 'react';
import { Save } from 'lucide-react';
import { APP_CONSTANTS } from '../../config/constants';
import BaseModal, { ModalFooter } from '../common/BaseModal';
import { Button } from '../ui/Button';
import BasicInfoSection from './components/BasicInfoSection';
import ContactInfoSection from './components/ContactInfoSection';
import AdditionalInfoSection from './components/AdditionalInfoSection';
import { validateCustomerForm, getInitialFormData, CustomerFormData } from './utils/validation';
import { ModalSize } from '../../types/enums';
import { getModalSizeString } from '../../utils/modalUtils';
import type { Customer } from '@/types/customer';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Partial<Customer>) => void;
  editData?: Customer | null;
  mode?: 'create' | 'edit' | 'view';
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState<CustomerFormData>(getInitialFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(getInitialFormData(editData));
    setErrors({});
  }, [editData, isOpen]);

  const handleSubmit = useCallback(() => {
    const validationErrors = validateCustomerForm(formData);
    
    if (Object.keys(validationErrors).length === 0) {
      onSave({
        ...formData,
        companyName: formData.companyName || formData.name
      });
    } else {
      setErrors(validationErrors);
    }
  }, [formData, onSave]);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const isViewMode = mode === 'view';

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return APP_CONSTANTS.TEXT.CUSTOMER.REGISTER;
      case 'edit': return APP_CONSTANTS.TEXT.CUSTOMER.EDIT;
      default: return APP_CONSTANTS.TEXT.CUSTOMER.INFO;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size={getModalSizeString(ModalSize.SM)}
    >
      <div className="bg-gray-50 -mx-6 -my-6 px-6 py-6">
        <div className="modal-section-spacing">
        <BasicInfoSection
          name={formData.name}
          companyName={formData.companyName}
          errors={errors}
          isViewMode={isViewMode}
          onChange={handleChange}
        />

        <ContactInfoSection
          contactPerson={formData.contactPerson}
          contactNumber={formData.contactNumber}
          email={formData.email}
          errors={errors}
          isViewMode={isViewMode}
          onChange={handleChange}
        />

        <AdditionalInfoSection
          address={formData.address}
          businessNumber={formData.businessNumber}
          industry={formData.industry}
          notes={formData.notes}
          isViewMode={isViewMode}
          onChange={handleChange}
        />
        </div>
      </div>

      {!isViewMode && (
        <ModalFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            {APP_CONSTANTS.TEXT.COMMON.CANCEL}
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {mode === 'create' ? APP_CONSTANTS.TEXT.COMMON.CREATE : APP_CONSTANTS.TEXT.COMMON.EDIT}
          </Button>
        </ModalFooter>
      )}
    </BaseModal>
  );
};

export default CustomerModal;