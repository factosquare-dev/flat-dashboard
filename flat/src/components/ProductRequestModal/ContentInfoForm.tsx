import React from 'react';
import { Beaker } from 'lucide-react';
import { FormInput } from '@/components/forms';
import ModalSection from '../common/ModalSection';

interface ReceiptInfo {
  targetType: string;
  useGuidance: string;
  quantity: string;
  shape: string;
  requiredFormulation: string;
}

interface ContentInfoFormProps {
  receiptInfo: ReceiptInfo;
  onChange: (field: keyof ReceiptInfo, value: string) => void;
}

const ContentInfoForm: React.FC<ContentInfoFormProps> = ({
  receiptInfo,
  onChange
}) => {
  return (
    <ModalSection title="내용물" icon={Beaker} iconColor="text-teal-600">
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="타겟제형"
          value={receiptInfo.targetType}
          onChange={(e) => onChange('targetType', e.target.value)}
          placeholder="예: 로션, 크림"
        />
        <FormInput
          label="사용감"
          value={receiptInfo.useGuidance}
          onChange={(e) => onChange('useGuidance', e.target.value)}
          placeholder="예: 산뜻한, 촉촉한"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="향/색"
          value={receiptInfo.quantity}
          onChange={(e) => onChange('quantity', e.target.value)}
          placeholder="예: 무향, 연한 핑크색"
        />
        <FormInput
          label="필수요청성분"
          value={receiptInfo.shape}
          onChange={(e) => onChange('shape', e.target.value)}
          placeholder="예: 나이아신아마이드"
        />
      </div>
    </ModalSection>
  );
};

export default ContentInfoForm;