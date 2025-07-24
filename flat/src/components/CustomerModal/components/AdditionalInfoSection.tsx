import React from 'react';
import { MapPin, Hash } from 'lucide-react';
import FormInput from '../../common/FormInput';
import FormTextarea from '../../common/FormTextarea';

interface AdditionalInfoSectionProps {
  address: string;
  businessNumber: string;
  industry: string;
  notes: string;
  isViewMode: boolean;
  onChange: (field: string, value: string) => void;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  address,
  businessNumber,
  industry,
  notes,
  isViewMode,
  onChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900">추가 정보</h3>
      <FormInput
        label="주소"
        value={address}
        onChange={(value) => onChange('address', value)}
        placeholder="주소를 입력하세요"
        icon={<MapPin className="w-4 h-4" />}
        disabled={isViewMode}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="사업자번호"
          value={businessNumber}
          onChange={(value) => onChange('businessNumber', value)}
          placeholder="000-00-00000"
          icon={<Hash className="w-4 h-4" />}
          disabled={isViewMode}
        />
        <FormInput
          label="업종"
          value={industry}
          onChange={(value) => onChange('industry', value)}
          placeholder="예: 화장품, 의료기기"
          disabled={isViewMode}
        />
      </div>
      <FormTextarea
        label="비고"
        value={notes}
        onChange={(value) => onChange('notes', value)}
        placeholder="추가 정보를 입력하세요"
        rows={3}
        disabled={isViewMode}
      />
    </div>
  );
};

export default AdditionalInfoSection;