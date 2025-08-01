import React, { useState, useCallback } from 'react';
import { FileText, Mail, AlertCircle } from 'lucide-react';
import EmailModal from '../EmailModal/index';
import BaseModal, { ModalFooter } from '../common/BaseModal';
import { FormInput } from '@/components/forms';
import { FormTextarea } from '@/components/forms';
import OrderInfoForm from './OrderInfoForm';
import ContentInfoForm from './ContentInfoForm';
import IngredientInfoForm from './IngredientInfoForm';
import { useModalFormValidation } from '@/hooks/useModalFormValidation';
import { ModalSize, ButtonVariant, ButtonSize } from '@/types/enums';
import { Button } from '../ui/Button';
import { getModalSizeString } from '@/utils/modalUtils';
import './ProductRequestModal.css';

interface ProductRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: ProductRequestData) => void;
  onSendEmail?: (data: ProductRequestData) => void;
  availableFactories?: Array<{ name: string; color: string }>;
}

interface ProductRequestData {
  brandName: string;
  targetProduct: string;
  receiveMethod: string;
  deliveryQuantity: string;
  usageLocation: string;
  consumptionUnit: string;
  receiptInfo: {
    targetType: string;
    useGuidance: string;
    quantity: string;
    shape: string;
    requiredFormulation: string;
  };
  contentInfo: {
    containerSpecifications: string;
    fillingVolume: string;
    functionalComponent: string;
    mainIngredient: string;
    productionPreference: string;
  };
  deliverySchedule: string;
  requirements: string;
}

const ProductRequestModal: React.FC<ProductRequestModalProps> = React.memo(({ 
  isOpen, 
  onClose, 
  onSave, 
  onSendEmail, 
  availableFactories 
}) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [formData, setFormData] = useState<ProductRequestData>({
    brandName: '',
    targetProduct: '',
    receiveMethod: '',
    deliveryQuantity: '',
    usageLocation: '',
    consumptionUnit: '',
    receiptInfo: {
      targetType: '',
      useGuidance: '',
      quantity: '',
      shape: '',
      requiredFormulation: '',
    },
    contentInfo: {
      containerSpecifications: '',
      fillingVolume: '',
      functionalComponent: '',
      mainIngredient: '',
      productionPreference: '',
    },
    deliverySchedule: '',
    requirements: '',
  });
  const [isSaved, setIsSaved] = useState(false);
  
  // Validation rules
  const validationRules = {
    brandName: { required: true },
    targetProduct: { required: true },
    deliveryQuantity: { required: true },
    usageLocation: { required: true },
    deliverySchedule: { required: true }
  };

  const {
    errors,
    touched,
    formRef,
    handleSubmit: handleFormSubmit,
    handleFieldChange,
    resetForm,
    isSubmitting
  } = useModalFormValidation(formData, {
    rules: validationRules,
    onSubmit: async (data) => {
      if (onSave) {
        onSave(data);
        setIsSaved(true);
      }
    }
  });

  // 모달이 닫힐 때 저장 상태 초기화
  React.useEffect(() => {
    if (!isOpen) {
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleSave = useCallback(() => {
    const form = formRef.current;
    if (form) {
      form.requestSubmit();
    }
  }, [formRef]);

  const handleSendEmail = useCallback(() => {
    if (!isSaved) {
      // Auto-save before sending email for better UX
      handleSave();
    }
    
    onClose(); // ProductRequestModal 닫기
    setTimeout(() => {
      setShowEmailModal(true);
    }, 100);
  }, [isSaved, handleSave, onClose]);
  
  const handleEmailSend = useCallback(() => {
    setShowEmailModal(false);
    if (onSendEmail) {
      onSendEmail(formData);
    }
  }, [onSendEmail, formData]);

  const updateReceiptInfo = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      receiptInfo: {
        ...prev.receiptInfo,
        [field]: value
      }
    }));
  }, []);

  const updateContentInfo = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contentInfo: {
        ...prev.contentInfo,
        [field]: value
      }
    }));
  }, []);

  const updateMainField = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    handleFieldChange(field as keyof ProductRequestData, value);
  }, [handleFieldChange]);

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <span className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            제품 개발 정보
          </span>
        }
        size={getModalSizeString(ModalSize.LG)}
        footer={
          <ModalFooter>
            <div className="flex justify-between items-center w-full">
              <Button
                variant={ButtonVariant.PRIMARY}
                size={ButtonSize.MD}
                onClick={handleSendEmail}
              >
                <Mail className="w-4 h-4" />
                메일 보내기
              </Button>
              <div className="flex gap-3">
                <Button
                  variant={ButtonVariant.SECONDARY}
                  size={ButtonSize.MD}
                  onClick={onClose}
                >
                  취소
                </Button>
                <Button
                  variant={ButtonVariant.PRIMARY}
                  size={ButtonSize.MD}
                  onClick={handleSave}
                  disabled={isSaved || isSubmitting}
                  loading={isSubmitting}
                >
                  {isSaved ? '저장됨' : '저장'}
                </Button>
              </div>
            </div>
          </ModalFooter>
        }
      >
        <form ref={formRef} onSubmit={handleFormSubmit} className="bg-gray-50 -mx-6 -my-6 px-6 py-6">
          <div className="modal-section-spacing">
          {/* Validation error message */}
          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <div className="product-request-modal__error">
              <AlertCircle className="product-request-modal__error-icon" />
              <span>필수 입력 항목을 모두 입력해주세요</span>
            </div>
          )}
          {/* 브랜드명 및 제품명 */}
          <div className="modal-grid-2">
            <FormInput
              label="브랜드명"
              name="brandName"
              value={formData.brandName}
              onChange={(e) => updateMainField('brandName', e.target.value)}
              placeholder="브랜드명을 입력하세요"
              required
              error={touched.brandName ? errors.brandName : undefined}
            />
            <FormInput
              label="타겟 제품"
              name="targetProduct"
              value={formData.targetProduct}
              onChange={(e) => updateMainField('targetProduct', e.target.value)}
              placeholder="타겟 제품을 입력하세요"
              required
              error={touched.targetProduct ? errors.targetProduct : undefined}
            />
          </div>

          {/* 발주 정보 */}
          <OrderInfoForm
            deliveryQuantity={formData.deliveryQuantity}
            usageLocation={formData.usageLocation}
            receiveMethod={formData.receiveMethod}
            consumptionUnit={formData.consumptionUnit}
            onChange={updateMainField}
          />

          {/* 내용물 정보 */}
          <ContentInfoForm
            receiptInfo={formData.receiptInfo}
            onChange={updateReceiptInfo}
          />

          {/* 성분 정보 */}
          <IngredientInfoForm
            contentInfo={formData.contentInfo}
            onChange={updateContentInfo}
          />

          {/* 출시 예정일 */}
          <FormInput
            type="date"
            label="출시 예정일"
            name="deliverySchedule"
            value={formData.deliverySchedule}
            onChange={(e) => updateMainField('deliverySchedule', e.target.value)}
            required
            error={touched.deliverySchedule ? errors.deliverySchedule : undefined}
          />

          {/* 요청사항 */}
          <FormTextarea
            label="요청사항"
            value={formData.requirements}
            onChange={(e) => updateMainField('requirements', e.target.value)}
            rows={4}
            placeholder="추가 요청사항을 입력하세요"
          />
          </div>
        </form>
      </BaseModal>
      
      {/* Email Modal */}
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSend={handleEmailSend}
        showBackButton={true}
        onBack={() => setShowEmailModal(false)}
        defaultRecipients=""
        availableFactories={availableFactories}
      />
    </>
  );
});

ProductRequestModal.displayName = 'ProductRequestModal';

export default ProductRequestModal;