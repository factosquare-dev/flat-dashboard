import React from 'react';
import { MessageCircle, Users, Clock } from 'lucide-react';

const Comments: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">댓글 관리</h1>
        <p className="text-gray-600">프로젝트별 댓글을 확인하고 관리할 수 있습니다.</p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">댓글 기능</h2>
        </div>

        <div className="p-6">
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">댓글 기능이 구현되었습니다!</h3>
            <p className="text-gray-600 mb-6">
              프로젝트 상세 페이지에서 댓글 버튼을 클릭하여 댓글을 작성하고 관리할 수 있습니다.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Master & Sub 프로젝트</h4>
                <p className="text-sm text-blue-700">
                  Master 프로젝트와 Sub 프로젝트는 하나의 프로젝트 그룹이므로 댓글을 공유합니다.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Independent 프로젝트</h4>
                <p className="text-sm text-green-700">
                  Independent 프로젝트는 독립적인 댓글 시스템을 사용합니다.
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>사용 방법:</strong> 프로젝트 목록에서 프로젝트를 클릭하여 상세 페이지로 이동한 후, 
                상단의 댓글 버튼을 클릭하면 오른쪽에 댓글 사이드바가 나타납니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comments;