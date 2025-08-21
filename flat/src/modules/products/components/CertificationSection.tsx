import React from 'react';

interface CertificationSectionProps {
  data: {
    exportCountry?: string;
    clinicalTrial?: string;
    functionalCertifications?: string[];
    desiredShelfLife?: string;
    forInfants?: string;
    otherCertifications?: string[];
  };
  onChange: (field: string, value: any) => void;
}

export const CertificationSection: React.FC<CertificationSectionProps> = ({ data, onChange }) => {
  const [showOtherInput, setShowOtherInput] = React.useState<number | null>(null);
  const [customOtherCert, setCustomOtherCert] = React.useState('');
  const [showFunctionalOtherInput, setShowFunctionalOtherInput] = React.useState<number | null>(null);
  const [customFunctionalCert, setCustomFunctionalCert] = React.useState('');
  
  const certificationOptions = [
    '미백',
    '주름개선',
    '자외선차단',
    '아토피개선',
    '여드름개선',
    '탄력개선',
    '모공개선',
    '기타'
  ];
  
  const countryOptions = [
    '미국',
    '중국',
    '일본',
    '유럽',
    '동남아',
    '중동',
    '호주',
    '캠나다',
    '러시아',
    '인도',
    '기타'
  ];
  
  const otherCertOptions = [
    '비건',
    '크루얼티프리',
    '할랄',
    '코셔',
    '에코서트',
    '더마테스트',
    'ISO 22716',
    'GMP',
    'FDA',
    'CE',
    '기타'
  ];

  const handleAddCertification = () => {
    const currentCerts = data.functionalCertifications || [];
    if (currentCerts.length < 5) {
      onChange('functionalCertifications', [...currentCerts, '']);
    }
  };

  const handleRemoveCertification = (index: number) => {
    const currentCerts = data.functionalCertifications || [];
    onChange('functionalCertifications', currentCerts.filter((_, i) => i !== index));
    if (showFunctionalOtherInput === index) {
      setShowFunctionalOtherInput(null);
      setCustomFunctionalCert('');
    }
  };

  const handleCertificationChange = (index: number, value: string) => {
    if (value === '기타') {
      setShowFunctionalOtherInput(index);
    } else {
      setShowFunctionalOtherInput(null);
      const currentCerts = data.functionalCertifications || [];
      const updated = [...currentCerts];
      updated[index] = value;
      onChange('functionalCertifications', updated);
    }
  };
  
  const handleCustomFunctionalSubmit = (index: number) => {
    if (customFunctionalCert.trim()) {
      const currentCerts = data.functionalCertifications || [];
      const updated = [...currentCerts];
      updated[index] = customFunctionalCert.trim();
      onChange('functionalCertifications', updated);
      setShowFunctionalOtherInput(null);
      setCustomFunctionalCert('');
    }
  };
  
  const handleAddOtherCertification = () => {
    const currentOthers = data.otherCertifications || [];
    if (currentOthers.length < 5) {
      onChange('otherCertifications', [...currentOthers, '']);
    }
  };
  
  const handleRemoveOtherCertification = (index: number) => {
    const currentOthers = data.otherCertifications || [];
    onChange('otherCertifications', currentOthers.filter((_, i) => i !== index));
    if (showOtherInput === index) {
      setShowOtherInput(null);
      setCustomOtherCert('');
    }
  };
  
  const handleOtherCertificationChange = (index: number, value: string) => {
    if (value === '기타') {
      setShowOtherInput(index);
    } else {
      setShowOtherInput(null);
      const currentOthers = data.otherCertifications || [];
      const updated = [...currentOthers];
      updated[index] = value;
      onChange('otherCertifications', updated);
    }
  };
  
  const handleCustomOtherSubmit = (index: number) => {
    if (customOtherCert.trim()) {
      const currentOthers = data.otherCertifications || [];
      const updated = [...currentOthers];
      updated[index] = customOtherCert.trim();
      onChange('otherCertifications', updated);
      setShowOtherInput(null);
      setCustomOtherCert('');
    }
  };
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">각종 인증 및 허가(선택 사항)</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="exportCountry" className="block text-sm font-medium mb-1">수출국가</label>
          <select
            id="exportCountry"
            value={data.exportCountry || ''}
            onChange={(e) => onChange('exportCountry', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">선택하세요</option>
            {countryOptions.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            * 해외 판매용 제품 OEM/ODM을 경우 수출국가명 필수 입력. 수출전용 표시 제품은 OCS 인증서 필요 (통상 약 1~3개월 소요됨)
          </p>
          <p className="text-xs text-gray-500">
            * 수출 국가 화장품법, 해외 인허가 필요시 사전 수출국명 필수 입력. 수출전용 표시 제품은 내수 유통 및 통관불가
          </p>
        </div>
        
        <div>
          <label htmlFor="clinicalTrial" className="block text-sm font-medium mb-1">임상시험</label>
          <textarea
            id="clinicalTrial"
            className="min-h-[60px] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="임상시험 요구사항을 입력하세요"
            value={data.clinicalTrial || ''}
            onChange={(e) => onChange('clinicalTrial', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">기능성 인증 (샘플 제작후 선택 가능)</label>
          <div className="space-y-2 mt-2">
            {(data.functionalCertifications || []).map((cert, index) => {
              // Get already selected certifications excluding current one
              const selectedCerts = (data.functionalCertifications || []).filter((_, i) => i !== index);
              // Filter out already selected options
              const availableOptions = certificationOptions.filter(
                option => !selectedCerts.includes(option) || option === cert
              );
              
              return (
                <div key={index} className="flex gap-2">
                  {showFunctionalOtherInput === index ? (
                    <>
                      <input
                        type="text"
                        value={customFunctionalCert}
                        onChange={(e) => setCustomFunctionalCert(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCustomFunctionalSubmit(index);
                          }
                        }}
                        placeholder="기능성 인증명을 입력하세요"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleCustomFunctionalSubmit(index)}
                        className="px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                      >
                        확인
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowFunctionalOtherInput(null);
                          setCustomFunctionalCert('');
                        }}
                        className="px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <select
                        value={cert}
                        onChange={(e) => handleCertificationChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">선택하세요</option>
                        {availableOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(index)}
                        className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              );
            })}
            {(!data.functionalCertifications || data.functionalCertifications.length < 5) && (
              <button
                type="button"
                onClick={handleAddCertification}
                className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
              >
                + 기능성 인증 추가
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="desiredShelfLife" className="block text-sm font-medium mb-1">희망 유통기한</label>
            <select
              id="desiredShelfLife"
              value={data.desiredShelfLife || ''}
              onChange={(e) => onChange('desiredShelfLife', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">마우스로 선택</option>
              <option value="6개월">6개월</option>
              <option value="12개월">12개월</option>
              <option value="18개월">18개월</option>
              <option value="24개월">24개월</option>
              <option value="30개월">30개월</option>
              <option value="36개월">36개월</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="forInfants" className="block text-sm font-medium mb-1">유아용 여부</label>
            <select
              id="forInfants"
              value={data.forInfants || ''}
              onChange={(e) => onChange('forInfants', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">선택하세요</option>
              <option value="예">예</option>
              <option value="아니오">아니오</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">기타 인증</label>
          <div className="space-y-2 mt-2">
            {(data.otherCertifications || []).map((cert, index) => {
              // Get already selected certifications excluding current one
              const selectedOthers = (data.otherCertifications || []).filter((_, i) => i !== index);
              // Filter out already selected options
              const availableOtherOptions = otherCertOptions.filter(
                option => !selectedOthers.includes(option) || option === cert
              );
              
              return (
                <div key={index} className="flex gap-2">
                  {showOtherInput === index ? (
                    <>
                      <input
                        type="text"
                        value={customOtherCert}
                        onChange={(e) => setCustomOtherCert(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCustomOtherSubmit(index);
                          }
                        }}
                        placeholder="인증명을 입력하세요"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleCustomOtherSubmit(index)}
                        className="px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                      >
                        확인
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOtherInput(null);
                          setCustomOtherCert('');
                        }}
                        className="px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <select
                        value={cert}
                        onChange={(e) => handleOtherCertificationChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">선택하세요</option>
                        {availableOtherOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveOtherCertification(index)}
                        className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              );
            })}
            {(!data.otherCertifications || data.otherCertifications.length < 5) && (
              <button
                type="button"
                onClick={handleAddOtherCertification}
                className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
              >
                + 기타 인증 추가
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};