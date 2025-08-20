import React, { useState } from 'react';
import { BasicInfoSection } from './components/BasicInfoSection';
import { OrderInfoSection } from './components/OrderInfoSection';
import { ConceptSection } from './components/ConceptSection';
import { ContentsSection } from './components/ContentsSection';
import { ContainerSection } from './components/ContainerSection';
import { CertificationSection } from './components/CertificationSection';
import { TaskCheckerSection } from './components/TaskCheckerSection';

interface ProductDevelopmentFormData {
  // Basic Info
  companyName?: string;
  brandName?: string;
  productLine?: string;
  productVolume?: string;
  
  // Order Info
  orderQuantity?: string;
  contractQuantity?: string;
  testQuantity?: string;
  totalQuantity?: string;
  
  // Concept
  brandType?: string;
  productInfo?: string;
  targetMarket?: string;
  productFeatures?: string[];
  
  // Contents
  requestVolume?: string;
  requestType?: string;
  batchSize?: string;
  deliveryDate?: string;
  
  // Container
  container?: string;
  capacity?: string;
  containerType?: string;
  
  // Certification
  exportCountry?: string;
  importRegulations?: string;
  certificationNotes?: string;
}

export const ProductDevelopmentForm: React.FC = () => {
  const [formData, setFormData] = useState<ProductDevelopmentFormData>({});
  
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: API 호출 로직 추가
    alert('제품 개발 의뢰서가 제출되었습니다.');
  };
  
  const handleSaveDraft = () => {
    console.log('Draft saved:', formData);
    // TODO: 임시 저장 로직 추가
    alert('임시 저장되었습니다.');
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-500">FACTOSQUARE 제품개발의뢰서</h1>
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={handleSaveDraft}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            임시 저장
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            제출하기
          </button>
        </div>
      </div>
      
      <BasicInfoSection 
        data={formData} 
        onChange={handleFieldChange} 
      />
      
      <OrderInfoSection 
        data={formData} 
        onChange={handleFieldChange} 
      />
      
      <ConceptSection 
        data={formData} 
        onChange={handleFieldChange} 
      />
      
      <ContentsSection 
        data={formData} 
        onChange={handleFieldChange} 
      />
      
      <ContainerSection 
        data={formData} 
        onChange={handleFieldChange} 
      />
      
      <CertificationSection 
        data={formData} 
        onChange={handleFieldChange} 
      />
    </form>
  );
};