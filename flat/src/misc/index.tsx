import React from 'react';
import { Wrench, Clock, AlertTriangle } from 'lucide-react';

const Maintenance: React.FC = () => {
  // 임시 에러 - 나중에 제거
  throw new Error('Maintenance 페이지는 현재 점검 중입니다. 잠시 후 다시 이용해주세요.');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
            <Wrench className="w-10 h-10 text-orange-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            시스템 점검 중
          </h1>
          
          <p className="text-gray-600 mb-6">
            더 나은 서비스 제공을 위해 시스템 점검을 진행하고 있습니다.
            <br />
            잠시 후 다시 이용해 주세요.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
            <Clock className="w-4 h-4" />
            <span>예상 완료 시간: 약 30분</span>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                긴급한 문제가 있으시면 관리자에게 문의해 주세요.
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;