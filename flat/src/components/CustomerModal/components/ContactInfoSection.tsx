import React from 'react';
import { User, Phone, Mail } from 'lucide-react';
import FormInput from '../../common/FormInput';

interface ContactInfoSectionProps {
  contactPerson: string;
  contactNumber: string;
  email: string;
  errors: Record<string, string>;
  isViewMode: boolean;
  onChange: (field: string, value: string) => void;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  contactPerson,
  contactNumber,
  email,
  errors,
  isViewMode,
  onChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
        <User className="w-4 h-4" />
        담당자 정보
      </h3>
      <div className="space-y-4">
        <FormInput
          label="담당자명"
          value={contactPerson}
          onChange={(value) => onChange('contactPerson', value)}
          placeholder="담당자명을 입력하세요"
          required
          disabled={isViewMode}
          error={errors.contactPerson}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="연락처"
            value={contactNumber}
            onChange={(value) => onChange('contactNumber', value)}
            placeholder="010-0000-0000"
            icon={<Phone className="w-4 h-4" />}
            required
            disabled={isViewMode}
            error={errors.contactNumber}
          />
          <FormInput
            label="이메일"
            value={email}
            onChange={(value) => onChange('email', value)}
            placeholder="example@company.com"
            icon={<Mail className="w-4 h-4" />}
            required
            disabled={isViewMode}
            error={errors.email}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;