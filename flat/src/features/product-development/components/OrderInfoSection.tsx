import React from 'react';

interface OrderInfoSectionProps {
  data: {
    orderQuantity?: string;
    contractQuantity?: string;
    testQuantity?: string;
    totalQuantity?: string;
  };
  onChange: (field: string, value: string) => void;
}

export const OrderInfoSection: React.FC<OrderInfoSectionProps> = ({ data, onChange }) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">발주 정보</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="orderQuantity" className="block text-sm font-medium mb-1">최발 출시 예정일</label>
          <input
            id="orderQuantity"
            value={data.orderQuantity || ''}
            onChange={(e) => onChange('orderQuantity', e.target.value)}
            placeholder="최발 출시 예정일"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="contractQuantity" className="block text-sm font-medium mb-1">최발 월주 수량</label>
          <input
            id="contractQuantity"
            value={data.contractQuantity || ''}
            onChange={(e) => onChange('contractQuantity', e.target.value)}
            placeholder="최발 월주 수량"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="testQuantity" className="block text-sm font-medium mb-1">최발 단가</label>
          <input
            id="testQuantity"
            value={data.testQuantity || ''}
            onChange={(e) => onChange('testQuantity', e.target.value)}
            placeholder="최발 단가"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="totalQuantity" className="block text-sm font-medium mb-1">최발 용량</label>
          <input
            id="totalQuantity"
            value={data.totalQuantity || ''}
            onChange={(e) => onChange('totalQuantity', e.target.value)}
            placeholder="최발 용량"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
    </div>
  );
};