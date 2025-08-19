import React from 'react';

interface ConceptSectionProps {
  data: {
    brandType?: string;
    productInfo?: string;
    targetMarket?: string;
    productFeatures?: string[];
  };
  onChange: (field: string, value: any) => void;
}

export const ConceptSection: React.FC<ConceptSectionProps> = ({ data, onChange }) => {
  const features = [
    '브랜드명',
    '제품명(이형 여부)',
    '타켓 계층(F1-3)',
    '제품 컨셉',
    '최발 제형',
    '최발 사용감',
    '향',
    '색'
  ];

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = data.productFeatures || [];
    const updated = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    onChange('productFeatures', updated);
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">컨셉</h3>
      
      <div className="space-y-4">
        {features.map((feature) => (
          <div key={feature} className="flex items-start space-x-2">
            <input
              type="checkbox"
              id={feature}
              checked={(data.productFeatures || []).includes(feature)}
              onChange={() => handleFeatureToggle(feature)}
              className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
            <label htmlFor={feature} className="text-sm font-normal cursor-pointer">
              {feature}
            </label>
          </div>
        ))}
        
        <div className="mt-4">
          <label htmlFor="additionalNotes" className="block text-sm font-medium mb-1">추가 요청사항</label>
          <textarea
            id="additionalNotes"
            className="min-h-[100px] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="추가 요청사항을 입력해주세요"
            value={data.brandType || ''}
            onChange={(e) => onChange('brandType', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};