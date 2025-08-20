import React from 'react';

interface OrderInfoSectionProps {
  data: {
    expectedLaunchDate?: string;
    expectedOrderQuantity?: string;
    expectedUnitPrice?: string;
    expectedVolume?: string;
  };
  onChange: (field: string, value: string) => void;
}

export const OrderInfoSection: React.FC<OrderInfoSectionProps> = ({ data, onChange }) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">발주 정보</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expectedLaunchDate" className="block text-sm font-medium mb-1">희망 출시 예정일</label>
          <input
            id="expectedLaunchDate"
            type="date"
            value={data.expectedLaunchDate || ''}
            onChange={(e) => onChange('expectedLaunchDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="expectedOrderQuantity" className="block text-sm font-medium mb-1">희망 발주 수량</label>
          <input
            id="expectedOrderQuantity"
            type="number"
            value={data.expectedOrderQuantity || ''}
            onChange={(e) => onChange('expectedOrderQuantity', e.target.value)}
            placeholder="수량을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="expectedUnitPrice" className="block text-sm font-medium mb-1">희망 단가</label>
          <input
            id="expectedUnitPrice"
            type="number"
            value={data.expectedUnitPrice || ''}
            onChange={(e) => onChange('expectedUnitPrice', e.target.value)}
            placeholder="단가를 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="expectedVolume" className="block text-sm font-medium mb-1">희망 용량</label>
          <input
            id="expectedVolume"
            value={data.expectedVolume || ''}
            onChange={(e) => onChange('expectedVolume', e.target.value)}
            placeholder="용량을 입력하세요 (예: 500ml)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
    </div>
  );
};