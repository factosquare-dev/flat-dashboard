import React from 'react';
import { Users } from 'lucide-react';
import type { ProjectData } from './types';
import { FormSection, FormRow, FormField } from '../common/FormSection';
import FormInput from '../common/FormInput';

interface BasicInfoSectionProps {
  formData: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, onChange }) => {
  return (
    <FormSection title="기본 정보" icon={Users} iconColor="text-blue-600">
      <FormRow columns={2}>
        <FormField label="고객명" required>
          <FormInput
            type="text"
            value={formData.client}
            onChange={(e) => onChange({ client: e.target.value })}
            placeholder="고객명을 입력하세요"
            required
          />
        </FormField>
        <FormField label="담당자" required>
          <FormInput
            type="text"
            value={formData.manager}
            onChange={(e) => onChange({ manager: e.target.value })}
            placeholder="담당자명을 입력하세요"
            required
          />
        </FormField>
      </FormRow>
    </FormSection>
  );
};

export default BasicInfoSection;