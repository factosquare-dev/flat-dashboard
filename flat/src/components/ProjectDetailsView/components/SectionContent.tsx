import React from 'react';
import type { Project } from '@/types/project';

interface SectionContentProps {
  section: string;
  selectedProject?: Project;
}

export const SectionContent: React.FC<SectionContentProps> = ({
  section,
  selectedProject
}) => {
  const renderSectionContent = () => {
    switch (section) {
      case 'request':
        return (
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">제품 개발 의뢰서</h3>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-600">의뢰일자: 2025.01.15</p>
                <p className="text-sm text-gray-600">의뢰내용: 스킨케어 제품 개발</p>
                <p className="text-sm text-gray-600">담당자: 김개발</p>
              </div>
            </div>
          </div>
        );
      case 'content':
        return (
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">내용물</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded border border-blue-200">
                <p className="text-sm font-medium">주요 성분</p>
                <p className="text-sm text-gray-600 mt-1">히알루론산, 나이아신아마이드</p>
              </div>
              <div className="bg-white p-4 rounded border border-blue-200">
                <p className="text-sm font-medium">용량</p>
                <p className="text-sm text-gray-600 mt-1">150ml</p>
              </div>
            </div>
          </div>
        );
      case 'container':
        return (
          <div className="p-6 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">용기</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded border border-green-200">
                <p className="text-sm font-medium">용기 타입</p>
                <p className="text-sm text-gray-600 mt-1">펌프 보틀</p>
              </div>
              <div className="bg-white p-4 rounded border border-green-200">
                <p className="text-sm font-medium">재질</p>
                <p className="text-sm text-gray-600 mt-1">PET</p>
              </div>
              <div className="bg-white p-4 rounded border border-green-200">
                <p className="text-sm font-medium">색상</p>
                <p className="text-sm text-gray-600 mt-1">투명</p>
              </div>
            </div>
          </div>
        );
      case 'design':
        return (
          <div className="p-6 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">디자인표시문구</h3>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded border border-purple-200">
                <p className="text-sm font-medium">제품명</p>
                <p className="text-sm text-gray-600 mt-1">{selectedProject?.name || '제품명'}</p>
              </div>
              <div className="bg-white p-4 rounded border border-purple-200">
                <p className="text-sm font-medium">표시사항</p>
                <p className="text-sm text-gray-600 mt-1">사용방법, 주의사항, 제조번호 표기</p>
              </div>
            </div>
          </div>
        );
      case 'certification':
        return (
          <div className="p-6 bg-orange-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">인증인허가임상</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded border border-orange-200">
                <p className="text-sm font-medium">인증 상태</p>
                <p className="text-sm text-gray-600 mt-1">진행중</p>
              </div>
              <div className="bg-white p-4 rounded border border-orange-200">
                <p className="text-sm font-medium">예상 완료일</p>
                <p className="text-sm text-gray-600 mt-1">2025.03.01</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return renderSectionContent();
};