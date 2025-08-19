import React from 'react';

interface ContentsSectionProps {
  data: {
    requestVolume?: string;
    requestType?: string;
    batchSize?: string;
    deliveryDate?: string;
  };
  onChange: (field: string, value: string) => void;
}

export const ContentsSection: React.FC<ContentsSectionProps> = ({ data, onChange }) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">내용물</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="requestVolume" className="block text-sm font-medium mb-1">필수 요청 성분</label>
          <input
            id="requestVolume"
            value={data.requestVolume || ''}
            onChange={(e) => onChange('requestVolume', e.target.value)}
            placeholder="필수 요청 성분"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="requestType" className="block text-sm font-medium mb-1">요청 성분</label>
          <input
            id="requestType"
            value={data.requestType || ''}
            onChange={(e) => onChange('requestType', e.target.value)}
            placeholder="요청 성분"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div className="col-span-2">
          <label htmlFor="batchSize" className="block text-sm font-medium mb-1">제형 특색성 및 사용가능 제형 기재</label>
          <input
            id="batchSize"
            value={data.batchSize || ''}
            onChange={(e) => onChange('batchSize', e.target.value)}
            placeholder="(관련 원료 사용 제한 유무 기재)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div>
          <label htmlFor="deliveryDate" className="block text-sm font-medium mb-1">필수 배제 성분</label>
          <input
            id="deliveryDate"
            value={data.deliveryDate || ''}
            onChange={(e) => onChange('deliveryDate', e.target.value)}
            placeholder="필수 배제 성분"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
    </div>
  );
};