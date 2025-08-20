import React from 'react';
import type { ProjectData } from './types';
import CustomerSelector from './components/CustomerSelector';
import ProductServiceSelector from './components/ProductServiceSelector';
import ManagerSelector from './components/ManagerSelector';

interface BasicInfoSectionProps {
  formData: ProjectData;
  onChange: (updates: Partial<ProjectData>) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, onChange }) => {
  console.log('BasicInfoSection rendered with formData.managerId:', formData.managerId);
  return (
    <div className="space-y-6">
      {/* Vertical Form Layout - Based on GG.png */}
      
      {/* Section 1: Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
        
        {/* Customer */}
        <CustomerSelector
          value={formData.customerId}
          onChange={(customerId, customerName) => {
            onChange({ 
              customerId,
              client: customerName 
            });
          }}
          required
        />

        {/* Product & Service */}
        <ProductServiceSelector
          productId={formData.productId}
          serviceType={formData.serviceType}
          onChange={(updates) => onChange(updates)}
          required
        />
      </div>

      {/* Section 2: Manager Assignment */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">담당자 배정</h3>
        
        <ManagerSelector
          value={formData.managerId}
          onChange={(managerIds, managerNames) => {
            onChange({ 
              managerId: managerIds,
              manager: managerNames 
            });
          }}
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;