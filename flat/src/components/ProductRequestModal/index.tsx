import React, { useState } from 'react';
import { FileText, Mail } from 'lucide-react';
import EmailModal from '../EmailModal/index';
import BaseModal from '../common/BaseModal';
import FormInput from '../common/FormInput';
import FormTextarea from '../common/FormTextarea';
import { Button } from '../ui/Button';
import OrderInfoForm from './OrderInfoForm';
import ContentInfoForm from './ContentInfoForm';
import IngredientInfoForm from './IngredientInfoForm';

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

const ProductRequestModal: React.FC<ProductRequestModalProps> = ({ 
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

  // 모달이 닫힐 때 저장 상태 초기화
  React.useEffect(() => {
    if (!isOpen) {
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
      setIsSaved(true);
    }
  };

  const handleSendEmail = () => {
    if (!isSaved) {
      if (window.confirm('제품 개발 의뢰서를 먼저 저장하시겠습니까?')) {
        handleSave();
      } else {
        return;
      }
    }
    
    onClose(); // ProductRequestModal 닫기
    setTimeout(() => {
      setShowEmailModal(true);
    }, 100);
  };
  
  const handleEmailSend = (emailData: any) => {
    setShowEmailModal(false);
    if (onSendEmail) {
      onSendEmail(formData);
    }
  };

  const updateReceiptInfo = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      receiptInfo: {
        ...prev.receiptInfo,
        [field]: value
      }
    }));
  };

  const updateContentInfo = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contentInfo: {
        ...prev.contentInfo,
        [field]: value
      }
    }));
  };

  const updateMainField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
        size="xl"
        footer={
          <div className="flex justify-between items-center">
            <Button 
              variant="success"
              onClick={handleSendEmail}
              icon={<Mail className="w-4 h-4" />}
            >
              메일 보내기
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>
                취소
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSave}
                disabled={isSaved}
              >
                {isSaved ? '저장됨' : '저장'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* 브랜드명 및 제품명 */}
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="브랜드명"
              value={formData.brandName}
              onChange={(e) => updateMainField('brandName', e.target.value)}
              placeholder="브랜드명을 입력하세요"
            />
            <FormInput
              label="타겟 제품"
              value={formData.targetProduct}
              onChange={(e) => updateMainField('targetProduct', e.target.value)}
              placeholder="타겟 제품을 입력하세요"
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
            value={formData.deliverySchedule}
            onChange={(e) => updateMainField('deliverySchedule', e.target.value)}
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
};

export default ProductRequestModal;