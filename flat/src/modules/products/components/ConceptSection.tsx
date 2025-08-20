import React from 'react';

interface ConceptSectionProps {
  data: {
    brandName?: string;
    productName?: string;
    isTemporaryName?: boolean;
    targetProductLink?: string;
    productConcept?: string;
    desiredFormulation?: string;
    desiredTexture?: string;
    fragrance?: string;
    color?: string;
  };
  onChange: (field: string, value: any) => void;
}

export const ConceptSection: React.FC<ConceptSectionProps> = ({ data, onChange }) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">컨셉</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="brandName" className="block text-sm font-medium mb-1">브랜드명</label>
          <input
            id="brandName"
            value={data.brandName || ''}
            onChange={(e) => onChange('brandName', e.target.value)}
            placeholder="브랜드명을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="productName" className="block text-sm font-medium mb-1">제품명</label>
          <div className="flex gap-2">
            <input
              id="productName"
              value={data.productName || ''}
              onChange={(e) => onChange('productName', e.target.value)}
              placeholder="제품명을 입력하세요"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <label className="flex items-center whitespace-nowrap">
              <input
                type="checkbox"
                checked={data.isTemporaryName || false}
                onChange={(e) => onChange('isTemporaryName', e.target.checked)}
                className="mr-1"
              />
              <span className="text-sm">가칭</span>
            </label>
          </div>
        </div>
        
        <div className="col-span-2">
          <label htmlFor="targetProductLink" className="block text-sm font-medium mb-1">타겟 제품 (링크)</label>
          <input
            id="targetProductLink"
            type="url"
            value={data.targetProductLink || ''}
            onChange={(e) => onChange('targetProductLink', e.target.value)}
            placeholder="타겟 제품 링크를 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div className="col-span-2">
          <label htmlFor="productConcept" className="block text-sm font-medium mb-1">제품 컨셉</label>
          <textarea
            id="productConcept"
            value={data.productConcept || ''}
            onChange={(e) => onChange('productConcept', e.target.value)}
            placeholder="제품 컨셉을 입력하세요"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="desiredFormulation" className="block text-sm font-medium mb-1">희망 제형</label>
          <input
            id="desiredFormulation"
            value={data.desiredFormulation || ''}
            onChange={(e) => onChange('desiredFormulation', e.target.value)}
            placeholder="희망 제형을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="desiredTexture" className="block text-sm font-medium mb-1">희망 사용감</label>
          <input
            id="desiredTexture"
            value={data.desiredTexture || ''}
            onChange={(e) => onChange('desiredTexture', e.target.value)}
            placeholder="희망 사용감을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="fragrance" className="block text-sm font-medium mb-1">향</label>
          <input
            id="fragrance"
            value={data.fragrance || ''}
            onChange={(e) => onChange('fragrance', e.target.value)}
            placeholder="향을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="color" className="block text-sm font-medium mb-1">색</label>
          <input
            id="color"
            value={data.color || ''}
            onChange={(e) => onChange('color', e.target.value)}
            placeholder="색을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
    </div>
  );
};