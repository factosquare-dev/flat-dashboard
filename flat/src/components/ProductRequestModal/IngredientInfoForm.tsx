import React from 'react';
import { TestTube } from 'lucide-react';
import { FormInput } from '@/components/forms';
import ModalSection from '@/common/ModalSection';

interface ContentInfo {
  containerSpecifications: string;
  fillingVolume: string;
  functionalComponent: string;
  mainIngredient: string;
  productionPreference: string;
}

interface IngredientInfoFormProps {
  contentInfo: ContentInfo;
  onChange: (field: keyof ContentInfo, value: string) => void;
}

const IngredientInfoForm: React.FC<IngredientInfoFormProps> = ({
  contentInfo,
  onChange
}) => {
  return (
    <ModalSection title="성분" icon={TestTube} iconColor="text-pink-600">
      <FormInput
        label="컨셉성분"
        value={contentInfo.containerSpecifications}
        onChange={(e) => onChange('containerSpecifications', e.target.value)}
        placeholder="예: 센텔라아시아티카추출물"
      />
      <FormInput
        label="기능성 여부"
        value={contentInfo.fillingVolume}
        onChange={(e) => onChange('fillingVolume', e.target.value)}
        placeholder="예: 미백, 주름개선"
      />
      <FormInput
        label="무첨가 요청 성분"
        value={contentInfo.functionalComponent}
        onChange={(e) => onChange('functionalComponent', e.target.value)}
        placeholder="예: 파라벤, 인공향료"
      />
      <FormInput
        label="희망 인증"
        value={contentInfo.mainIngredient}
        onChange={(e) => onChange('mainIngredient', e.target.value)}
        placeholder="예: 비건인증, EWG그린등급"
      />
      <FormInput
        label="희망 유통기한"
        value={contentInfo.productionPreference}
        onChange={(e) => onChange('productionPreference', e.target.value)}
        placeholder="예: 제조일로부터 24개월"
      />
    </ModalSection>
  );
};

export default IngredientInfoForm;