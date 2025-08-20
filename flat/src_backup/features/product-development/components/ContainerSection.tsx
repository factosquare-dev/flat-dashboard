import React from 'react';

interface ContainerSectionProps {
  data: {
    container?: string;
    capacity?: string;
    containerType?: string;
  };
  onChange: (field: string, value: string) => void;
}

export const ContainerSection: React.FC<ContainerSectionProps> = ({ data, onChange }) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">용기</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="container" className="block text-sm font-medium mb-1">용기</label>
          <select
            id="container"
            value={data.container || ''}
            onChange={(e) => onChange('container', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">마우스로 선택</option>
            <option value="bottle">병</option>
            <option value="tube">튜브</option>
            <option value="jar">단지</option>
            <option value="pouch">파우치</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium mb-1">용량</label>
          <select
            id="capacity"
            value={data.capacity || ''}
            onChange={(e) => onChange('capacity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">마우스로 선택</option>
            <option value="50ml">50ml</option>
            <option value="100ml">100ml</option>
            <option value="150ml">150ml</option>
            <option value="200ml">200ml</option>
            <option value="250ml">250ml</option>
            <option value="500ml">500ml</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="containerType" className="block text-sm font-medium mb-1">용기 종류</label>
          <select
            id="containerType"
            value={data.containerType || ''}
            onChange={(e) => onChange('containerType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">마우스로 선택</option>
            <option value="plastic">플라스틱</option>
            <option value="glass">유리</option>
            <option value="aluminum">알루미늄</option>
            <option value="paper">종이</option>
          </select>
        </div>
      </div>
    </div>
  );
};