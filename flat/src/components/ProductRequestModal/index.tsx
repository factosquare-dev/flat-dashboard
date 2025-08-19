import React, { useState, useCallback } from 'react';
import { FileText, Mail, AlertCircle } from 'lucide-react';
import EmailModal from '@/EmailModal/index';
import BaseModal, { ModalFooter } from '@/common/BaseModal';
import { BasicInfoForm } from './components/BasicInfoForm';
import { DeliveryForm } from './components/DeliveryForm';
import OrderInfoForm from './OrderInfoForm';
import ContentInfoForm from './ContentInfoForm';
import IngredientInfoForm from './IngredientInfoForm';
import { useProductRequestForm } from './hooks/useProductRequestForm';
import { ModalSize, ButtonVariant, ButtonSize } from '@/types/enums';
import { Button } from '@/ui/Button';
import { getModalSizeString } from '@/utils/modalUtils';
import type { ProductRequestModalProps } from './types';
import './ProductRequestModal.css';

const ProductRequestModal: React.FC<ProductRequestModalProps> = React.memo(({ 
  isOpen, 
  onClose, 
  onSave, 
  onSendEmail, 
  availableFactories 
}) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const { formData, updateFormData, resetForm, errors, validateForm } = useProductRequestForm();

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSave = useCallback(() => {
    if (!validateForm(formData)) {
      return;
    }
    
    onSave?.(formData);
    handleClose();
  }, [formData, validateForm, onSave, handleClose]);

  const handleSendEmail = useCallback(() => {
    if (!validateForm(formData)) {
      return;
    }
    
    setShowEmailModal(true);
  }, [formData, validateForm]);

  const handleEmailSend = useCallback((emailData: any) => {
    onSendEmail?.(formData);
    setShowEmailModal(false);
    handleClose();
  }, [formData, onSendEmail, handleClose]);

  const hasValidationErrors = Object.keys(errors).length > 0;

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        title="제품 의뢰"
        size={ModalSize.EXTRA_LARGE}
        className="product-request-modal"
      >
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Validation Error Alert */}
            {hasValidationErrors && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">필수 항목을 입력해주세요.</p>
                  <p className="mt-1">빨간색으로 표시된 항목을 확인하고 입력해주세요.</p>
                </div>
              </div>
            )}

            {/* Form Sections */}
            <BasicInfoForm 
              formData={formData} 
              updateFormData={updateFormData} 
              errors={errors} 
            />
            
            <OrderInfoForm 
              formData={formData} 
              updateFormData={updateFormData} 
              errors={errors} 
            />
            
            <ContentInfoForm 
              formData={formData} 
              updateFormData={updateFormData} 
              errors={errors} 
            />
            
            <IngredientInfoForm 
              formData={formData} 
              updateFormData={updateFormData} 
              errors={errors} 
            />
            
            <DeliveryForm 
              formData={formData} 
              updateFormData={updateFormData} 
              errors={errors} 
            />
          </div>
        </div>

        <ModalFooter>
          <div className="flex justify-between w-full">
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.MEDIUM}
              onClick={handleClose}
            >
              취소
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant={ButtonVariant.SECONDARY}
                size={ButtonSize.MEDIUM}
                onClick={handleSendEmail}
                disabled={hasValidationErrors}
              >
                <Mail className="h-4 w-4 mr-2" />
                이메일 발송
              </Button>
              <Button
                variant={ButtonVariant.PRIMARY}
                size={ButtonSize.MEDIUM}
                onClick={handleSave}
                disabled={hasValidationErrors}
              >
                <FileText className="h-4 w-4 mr-2" />
                저장
              </Button>
            </div>
          </div>
        </ModalFooter>
      </BaseModal>

      {/* Email Modal */}
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSend={handleEmailSend}
        recipients={availableFactories?.map(f => f.name) || []}
        subject={`제품 의뢰: ${formData.brandName} - ${formData.targetProduct}`}
        initialContent={generateEmailContent(formData)}
      />
    </>
  );
});

ProductRequestModal.displayName = 'ProductRequestModal';

// Helper function to generate email content
const generateEmailContent = (data: any): string => {
  return `
제품 의뢰서

[기본 정보]
- 브랜드명: ${data.brandName}
- 타겟 제품명: ${data.targetProduct}
- 수령 방법: ${data.receiveMethod}
- 납품 수량: ${data.deliveryQuantity}
- 사용처: ${data.usageLocation}
- 소비자가 단위: ${data.consumptionUnit}

[제품 정보]
- 타겟 타입: ${data.receiptInfo.targetType}
- 사용 안내: ${data.receiptInfo.useGuidance}
- 수량: ${data.receiptInfo.quantity}
- 형태: ${data.receiptInfo.shape}
- 필수 처방: ${data.receiptInfo.requiredFormulation}

[내용물 정보]
- 용기 사양: ${data.contentInfo.containerSpecifications}
- 충진 용량: ${data.contentInfo.fillingVolume}
- 기능성 성분: ${data.contentInfo.functionalComponent}
- 주요 성분: ${data.contentInfo.mainIngredient}
- 생산 선호도: ${data.contentInfo.productionPreference}

[납품 정보]
- 납품 일정: ${data.deliverySchedule}
- 기타 요구사항: ${data.requirements}
  `.trim();
};

export default ProductRequestModal;

// Export types
export type { ProductRequestModalProps, ProductRequestData } from './types';