import React, { useState, useEffect } from 'react';
import { BasicInfoSection } from './components/BasicInfoSection';
import { OrderInfoSection } from './components/OrderInfoSection';
import { ConceptSection } from './components/ConceptSection';
import { ContentsSection } from './components/ContentsSection';
import { ContainerSection } from './components/ContainerSection';
import { CertificationSection } from './components/CertificationSection';
import { TaskCheckerSection } from './components/TaskCheckerSection';

interface ProductDevelopmentFormData {
  // Basic Info
  createdDate?: string;
  sampleRequestDate?: string;
  companyName?: string;
  contactPerson?: string;
  contactNumber?: string;
  emailAddress?: string;
  sampleDeliveryAddress?: string;
  
  // Order Info
  expectedLaunchDate?: string;
  expectedOrderQuantity?: string;
  expectedUnitPrice?: string;
  expectedVolume?: string;
  
  // Concept
  brandName?: string;
  productName?: string;
  isTemporaryName?: boolean;
  targetProductLink?: string;
  productConcept?: string;
  desiredFormulation?: string;
  desiredTexture?: string;
  fragrance?: string;
  color?: string;
  
  // Contents
  requiredIngredients?: string[];
  optionalIngredients?: string[];
  excludedIngredients?: string[];
  
  // Container
  container?: string;
  sealingLabel?: string;
  unitBox?: string;
  design?: string;
  containerType?: string;
  
  // Certification
  exportCountry?: string;
  clinicalTrial?: string;
  functionalCertifications?: string[];
  desiredShelfLife?: string;
  forInfants?: string;
  otherCertifications?: string[];
}

interface ProductDevelopmentFormProps {
  projectId?: string;
  selectedProjectIndex?: number;
  onFormChange?: (hasChanges: boolean) => void;
}

export const ProductDevelopmentForm: React.FC<ProductDevelopmentFormProps> = ({ 
  projectId, 
  selectedProjectIndex, 
  onFormChange 
}) => {
  // 제품별 폼 데이터를 저장하는 Map
  const [formDataMap, setFormDataMap] = useState<Map<number, ProductDevelopmentFormData>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);

  // 현재 선택된 제품의 폼 데이터 가져오기
  const currentFormData = formDataMap.get(selectedProjectIndex || 0) || {};
  
  const handleFieldChange = (field: string, value: any) => {
    const currentIndex = selectedProjectIndex || 0;
    const updatedFormData = {
      ...currentFormData,
      [field]: value
    };
    
    setFormDataMap(prev => new Map(prev.set(currentIndex, updatedFormData)));
    setHasChanges(true);
  };

  // 변경사항을 부모 컴포넌트에 알림
  useEffect(() => {
    if (onFormChange) {
      onFormChange(hasChanges);
    }
  }, [hasChanges, onFormChange]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', currentFormData);
    // TODO: API 호출 로직 추가
    alert('제품 개발 의뢰서가 제출되었습니다.');
  };
  
  const handleSaveDraft = () => {
    console.log('Draft saved:', currentFormData);
    // TODO: 임시 저장 로직 추가
    alert('임시 저장되었습니다.');
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-orange-500 text-center">FACTOSQUARE 제품개발의뢰서</h1>
      </div>
      
      <BasicInfoSection 
        data={currentFormData} 
        onChange={handleFieldChange} 
      />
      
      <OrderInfoSection 
        data={currentFormData} 
        onChange={handleFieldChange} 
      />
      
      <ConceptSection 
        data={currentFormData} 
        onChange={handleFieldChange} 
      />
      
      <ContentsSection 
        data={currentFormData} 
        onChange={handleFieldChange} 
      />
      
      <ContainerSection 
        data={currentFormData} 
        onChange={handleFieldChange} 
      />
      
      <CertificationSection 
        data={currentFormData} 
        onChange={handleFieldChange} 
      />

      <div className="flex justify-center gap-4 pt-6 mt-8 border-t border-gray-200">
        <button 
          type="button" 
          onClick={handleSaveDraft}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          임시 저장
        </button>
        <button 
          type="submit" 
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          제출하기
        </button>
      </div>
    </form>
  );
};