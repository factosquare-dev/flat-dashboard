import React from 'react';
import { Building2 } from 'lucide-react';
import { APP_CONSTANTS } from '../../../config/constants';
import FormInput from '../../common/FormInput';

interface BasicInfoSectionProps {
  name: string;
  companyName: string;
  errors: Record<string, string>;
  isViewMode: boolean;
  onChange: (field: string, value: string) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  name,
  companyName,
  errors,
  isViewMode,
  onChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
        <Building2 className="w-4 h-4" />
        기본 정보
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label={APP_CONSTANTS.TEXT.CUSTOMER.NAME}
          value={name}
          onChange={(value) => onChange('name', value)}
          placeholder={`${APP_CONSTANTS.TEXT.CUSTOMER.NAME}을 입력하세요`}
          required
          disabled={isViewMode}
          error={errors.name}
        />
        <FormInput
          label={APP_CONSTANTS.TEXT.CUSTOMER.COMPANY}
          value={companyName}
          onChange={(value) => onChange('companyName', value)}
          placeholder={`${APP_CONSTANTS.TEXT.CUSTOMER.COMPANY}을 입력하세요`}
          disabled={isViewMode}
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;