import React from 'react';

interface BasicInfoSectionProps {
  data: {
    companyName?: string;
    brandName?: string;
    productLine?: string;
    productVolume?: string;
  };
  onChange: (field: string, value: string) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ data, onChange }) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-orange-500">제품개발의뢰서</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium mb-1">작성일</label>
          <input
            id="companyName"
            value={data.companyName || ''}
            onChange={(e) => onChange('companyName', e.target.value)}
            placeholder="업체명"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="brandName" className="block text-sm font-medium mb-1">생품 포장일</label>
          <input
            id="brandName"
            value={data.brandName || ''}
            onChange={(e) => onChange('brandName', e.target.value)}
            placeholder="담당자 성함"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="productLine" className="block text-sm font-medium mb-1">연락처</label>
          <input
            id="productLine"
            value={data.productLine || ''}
            onChange={(e) => onChange('productLine', e.target.value)}
            placeholder="이메일 주소"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="productVolume" className="block text-sm font-medium mb-1">생품수량주소</label>
          <input
            id="productVolume"
            value={data.productVolume || ''}
            onChange={(e) => onChange('productVolume', e.target.value)}
            placeholder="생품수량주소"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
    </div>
  );
};