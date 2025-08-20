import React from 'react';

interface CertificationSectionProps {
  data: {
    exportCountry?: string;
    importRegulations?: string;
    certificationNotes?: string;
  };
  onChange: (field: string, value: string) => void;
}

export const CertificationSection: React.FC<CertificationSectionProps> = ({ data, onChange }) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">각종 인증 및 허가(선택 사항)</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="exportCountry" className="block text-sm font-medium mb-1">수출국가</label>
          <textarea
            id="exportCountry"
            className="min-h-[60px] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="수출할 국가명을 입력하세요. 해외 판매용 제품 OEM/ODM을 경우 수출국가명 필수 입력. 수출전용 표시 제품은 OCS 인증서 필요 (통상 약 1~3개월 소요됨)"
            value={data.exportCountry || ''}
            onChange={(e) => onChange('exportCountry', e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            * 수출 국가 화장품법, 해외 인허가 필요시 사전 수출국명 필수 입력. 수출전용 표시 제품은 내수 유통 및 통관불가
          </p>
        </div>
        
        <div>
          <label htmlFor="importRegulations" className="block text-sm font-medium mb-1">임상시험</label>
          <textarea
            id="importRegulations"
            className="min-h-[60px] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="임상시험 요구사항을 입력하세요"
            value={data.importRegulations || ''}
            onChange={(e) => onChange('importRegulations', e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="certificationNotes" className="block text-sm font-medium mb-1">기능성 인증 (샘플 제작후 선택 가능)</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <button
              type="button"
              className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
              onClick={() => onChange('certificationNotes', '마우스로 선택')}
            >
              마우스로 선택
            </button>
            <button
              type="button"
              className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
              onClick={() => onChange('certificationNotes', '마우스로 선택')}
            >
              마우스로 선택
            </button>
            <button
              type="button"
              className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
              onClick={() => onChange('certificationNotes', '마우스로 선택')}
            >
              마우스로 선택
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};