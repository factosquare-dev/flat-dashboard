import React from 'react';

interface ContainerSectionProps {
  data: {
    container?: string;
    sealingLabel?: string;
    unitBox?: string;
    design?: string;
    containerType?: string;
  };
  onChange: (field: string, value: string) => void;
}

export const ContainerSection: React.FC<ContainerSectionProps> = ({ data, onChange }) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">용기</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="container" className="block text-sm font-medium mb-1">용기</label>
            <select
              id="container"
              value={data.container || ''}
              onChange={(e) => onChange('container', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">마우스로 선택</option>
              <option value="병">병</option>
              <option value="튜브">튜브</option>
              <option value="단지">단지</option>
              <option value="파우치">파우치</option>
              <option value="펌프">펌프</option>
              <option value="스프레이">스프레이</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sealingLabel" className="block text-sm font-medium mb-1">봉합라벨</label>
            <select
              id="sealingLabel"
              value={data.sealingLabel || ''}
              onChange={(e) => onChange('sealingLabel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">마우스로 선택</option>
              <option value="스티커">스티커</option>
              <option value="실링">실링</option>
              <option value="수축필름">수축필름</option>
              <option value="없음">없음</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="unitBox" className="block text-sm font-medium mb-1">단상자</label>
            <select
              id="unitBox"
              value={data.unitBox || ''}
              onChange={(e) => onChange('unitBox', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">마우스로 선택</option>
              <option value="있음">있음</option>
              <option value="없음">없음</option>
              <option value="옵션">옵션</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="design" className="block text-sm font-medium mb-1">디자인</label>
            <select
              id="design"
              value={data.design || ''}
              onChange={(e) => onChange('design', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">마우스로 선택</option>
              <option value="제공">제공</option>
              <option value="미제공">미제공</option>
              <option value="협의필요">협의필요</option>
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="containerType" className="block text-sm font-medium mb-1">용기 종류</label>
          <textarea
            id="containerType"
            value={data.containerType || ''}
            onChange={(e) => onChange('containerType', e.target.value)}
            placeholder="용기 종류를 입력하세요"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
    </div>
  );
};