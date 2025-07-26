import React, { useState, useEffect, useCallback } from 'react';
import { Save } from 'lucide-react';
import { APP_CONSTANTS } from '../../config/constants';
import { Modal } from '../common/CompoundModal';
import { Button } from '../ui/Button';
import BasicInfoSection from './components/BasicInfoSection';
import ContactInfoSection from './components/ContactInfoSection';
import AdditionalInfoSection from './components/AdditionalInfoSection';
import { validateCustomerForm, getInitialFormData, CustomerFormData } from './utils/validation';
import { ModalSize } from '../../types/enums';
import type { Customer } from '@/types/customer';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Partial<Customer>) => void;
  editData?: Customer | null;
  mode?: 'create' | 'edit' | 'view';
}

/**
 * Customer Modal using Compound Components Pattern
 * This demonstrates how to use the new Modal compound components
 */
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
    <Modal isOpen={isOpen} onClose={onClose} size={ModalSize.MD}>
      <Modal.Header>
        <Modal.Title>{getModalTitle()}</Modal.Title>
        {mode === 'create' && (
          <Modal.Description>
            새로운 고객 정보를 입력해주세요
          </Modal.Description>
        )}
      </Modal.Header>

      <Modal.Body className="bg-gray-50">
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
      </Modal.Body>

      {!isViewMode && (
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            icon={<Save className="w-4 h-4" />}
          >
            {mode === 'create' ? '등록' : '수정'}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default CustomerModal;