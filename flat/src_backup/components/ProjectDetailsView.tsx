import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockDataService } from '@/services/mockDataService';
import { ProjectType, ProductType } from '@/types/enums';
import type { Project } from '@/types/project';
import { ProductDevelopmentForm } from '@/features/product-development/ProductDevelopmentForm';
import { TaskCheckerToggle } from '@/features/product-development/components/TaskCheckerToggle';
import { ContentExcelTable } from '@/features/product-development/components/ContentExcelTable';

// ProductType을 한글로 변환하는 함수
const getProductTypeLabel = (type: ProductType | string): string => {
  const labels: Record<string, string> = {
    [ProductType.SKINCARE]: '스킨케어',
    [ProductType.MAKEUP]: '메이크업',
    [ProductType.HAIRCARE]: '헤어케어',
    [ProductType.BODYCARE]: '바디케어',
    [ProductType.PERFUME]: '향수',
    [ProductType.SUPPLEMENT]: '건강기능식품',
    [ProductType.DEVICE]: '미용기기',
    [ProductType.OTHER]: '기타',
  };
  return labels[type] || type || '제품유형';
};

interface ProjectDetailsViewProps {
  projectId?: string;
}

const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({ projectId }) => {
  const [subProjects, setSubProjects] = useState<Project[]>([]);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showContentTable, setShowContentTable] = useState(false);
  const itemsPerPage = 5; // 한 번에 최대 5개씩 표시

  // Load SUB projects for this master project
  useEffect(() => {
    if (projectId) {
      // Get all projects and filter SUB projects that belong to this master
      const allProjects = mockDataService.getAllProjects();
      const subs = allProjects.filter(
        (p) => p.parentId === projectId && p.type === ProjectType.SUB
      );
      
      setSubProjects(subs);
      setSelectedProjectIndex(0);
      setCurrentPageIndex(0);
    }
  }, [projectId]);

  // 중복된 제품유형에 번호 매기기
  const getProductLabel = (project: Project, index: number): string => {
    const baseLabel = getProductTypeLabel(project.productType || project.product?.productType);
    const sameTypeProjects = subProjects.filter(
      p => getProductTypeLabel(p.productType || p.product?.productType) === baseLabel
    );
    
    if (sameTypeProjects.length > 1) {
      const typeIndex = sameTypeProjects.findIndex(p => p.id === project.id);
      return `${baseLabel} (${typeIndex + 1})`;
    }
    
    return baseLabel;
  };

  // Currently selected SUB project
  const selectedProject = subProjects[selectedProjectIndex];
  
  // Pagination - show 5 projects at a time
  const totalPages = Math.ceil(subProjects.length / itemsPerPage);
  const currentProjects = subProjects.slice(
    currentPageIndex * itemsPerPage,
    (currentPageIndex + 1) * itemsPerPage
  );

  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handleSelectProject = (absoluteIndex: number) => {
    setSelectedProjectIndex(absoluteIndex);
  };

  const handleSectionToggle = (section: string) => {
    if (section === 'request') {
      setShowRequestForm(!showRequestForm);
      setShowContentTable(false);
      setExpandedSection(null);
    } else if (section === 'content') {
      setShowContentTable(!showContentTable);
      setShowRequestForm(false);
      setExpandedSection(null);
    } else {
      setExpandedSection(expandedSection === section ? null : section);
      setShowRequestForm(false);
      setShowContentTable(false);
    }
  };

  const renderSectionContent = (section: string) => {
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

  if (!subProjects.length) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <p className="text-center text-gray-500">SUB 프로젝트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Product Type Selector - Show 5 at a time */}
      <div className="flex items-center justify-center mb-6 px-4">
        <button
          onClick={handlePrevious}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous"
          disabled={currentPageIndex === 0}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex gap-3 mx-6">
          {currentProjects.map((project, idx) => {
            const absoluteIndex = currentPageIndex * itemsPerPage + idx;
            return (
              <div
                key={project.id}
                onClick={() => handleSelectProject(absoluteIndex)}
                className={`px-3 py-1.5 border-2 rounded-lg font-medium cursor-pointer transition-colors text-sm ${
                  selectedProjectIndex === absoluteIndex
                    ? 'bg-blue-100 border-blue-500 text-blue-900'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {getProductLabel(project, absoluteIndex)}
              </div>
            );
          })}
        </div>
        
        <button
          onClick={handleNext}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next"
          disabled={currentPageIndex === totalPages - 1}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Compact Professional Detail Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mx-4 mb-6">
        {selectedProject && (
          <div className="p-4">
            {/* Compact Header with Product Type */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">상세 정보</h3>
              <span className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
                {getProductLabel(selectedProject, selectedProjectIndex)}
              </span>
            </div>
            
            {/* Compact Two Column Layout */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {/* Left Column */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm min-w-[60px]">기간</span>
                  <span className="font-medium text-gray-900 text-sm">
                    {selectedProject.startDate ? (selectedProject.startDate instanceof Date ? selectedProject.startDate.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) : new Date(selectedProject.startDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })) : '-'}
                    ~
                    {selectedProject.endDate ? (selectedProject.endDate instanceof Date ? selectedProject.endDate.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) : new Date(selectedProject.endDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })) : '-'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm min-w-[60px]">수출국가</span>
                  <span className={`font-medium text-sm ${selectedProject.exportCountry ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedProject.exportCountry || '미정'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm min-w-[60px]">용량</span>
                  <span className={`font-medium text-sm ${selectedProject.product?.capacity ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedProject.product?.capacity || '미정'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm min-w-[60px]">기능성</span>
                  <span className={`font-medium text-sm ${selectedProject.product?.functionality ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedProject.product?.functionality || '미정'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm min-w-[60px]">수량</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 font-semibold rounded text-sm">
                    {selectedProject.quantity?.toLocaleString() || 0}개
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm min-w-[60px]">포장</span>
                  <span className={`font-medium text-sm ${selectedProject.packagingSpec ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedProject.packagingSpec || '미정'}
                  </span>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm min-w-[60px]">공장</span>
                  <span className={`font-medium text-sm ${selectedProject.factories?.[0]?.name ? 'text-blue-600' : 'text-gray-400'}`}>
                    {selectedProject.factories?.[0]?.name || '미정'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm min-w-[60px]">인증</span>
                  <span className={`font-medium text-sm ${selectedProject.certification ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedProject.certification || '미정'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm min-w-[60px]">부자재</span>
                  <span className={`font-medium text-sm ${selectedProject.subsidiaryMaterials ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedProject.subsidiaryMaterials || '미정'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm min-w-[60px]">랩넘버</span>
                  <span className={`px-2 py-0.5 bg-purple-100 text-purple-700 font-mono font-semibold rounded text-xs ${!selectedProject.labNumber && 'opacity-50'}`}>
                    {selectedProject.labNumber || 'PENDING'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm min-w-[60px]">상태</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-semibold rounded text-sm">
                      {selectedProject.status || '진행중'}
                    </span>
                    {selectedProject.progress !== undefined && (
                      <span className="text-gray-600 font-medium text-sm">{selectedProject.progress}%</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm min-w-[60px]">담당자</span>
                  <span className="font-medium text-gray-900 text-sm">
                    {selectedProject.assignee || '미배정'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 px-4">
        <div className="flex justify-center gap-3">
          <button 
            onClick={() => handleSectionToggle('request')}
            className={`px-4 py-2 border text-sm font-medium rounded-lg transition-all ${
              showRequestForm 
                ? 'bg-gray-700 text-white border-gray-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            제품 개발 의뢰서
          </button>
          <button 
            onClick={() => handleSectionToggle('content')}
            className={`px-4 py-2 border text-sm font-medium rounded-lg transition-all ${
              showContentTable 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            내용물
          </button>
          <button 
            onClick={() => handleSectionToggle('container')}
            className={`px-4 py-2 border text-sm font-medium rounded-lg transition-all ${
              expandedSection === 'container' 
                ? 'bg-green-600 text-white border-green-600' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            용기
          </button>
          <button 
            onClick={() => handleSectionToggle('design')}
            className={`px-4 py-2 border text-sm font-medium rounded-lg transition-all ${
              expandedSection === 'design' 
                ? 'bg-purple-600 text-white border-purple-600' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            디자인표시문구
          </button>
          <button 
            onClick={() => handleSectionToggle('certification')}
            className={`px-4 py-2 border text-sm font-medium rounded-lg transition-all ${
              expandedSection === 'certification' 
                ? 'bg-orange-600 text-white border-orange-600' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            인증인허가임상
          </button>
        </div>
        
        {/* Expanded Section Content with Animation */}
        <div className={`mt-4 overflow-hidden transition-all duration-500 ease-in-out ${
          expandedSection ? 'opacity-100' : 'max-h-0 opacity-0'
        }`}>
          {expandedSection && renderSectionContent(expandedSection)}
        </div>
      </div>

      {/* Product Development Form - 홍해가 갈라지는 효과 */}
      <div className={`transition-all duration-700 ease-in-out ${
        showRequestForm ? 'opacity-100' : 'hidden opacity-0'
      }`}>
        <div className={`transform transition-all duration-700 ${
          showRequestForm ? 'translate-y-0' : '-translate-y-10'
        }`}>
          <div className="relative mt-6">
            {/* 갈라지는 효과를 위한 그라디언트 */}
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-transparent via-blue-50 to-white pointer-events-none"></div>
            
            {/* 폼 컨테이너 */}
            <div className="relative bg-white border-2 border-blue-200 rounded-lg shadow-lg">
              <ProductDevelopmentForm />
            </div>
          </div>
        </div>
      </div>

      {/* Content Excel Table - 홍해가 갈라지는 효과 */}
      <div className={`transition-all duration-700 ease-in-out ${
        showContentTable ? 'opacity-100' : 'hidden opacity-0'
      }`}>
        <div className={`transform transition-all duration-700 ${
          showContentTable ? 'translate-y-0' : '-translate-y-10'
        }`}>
          <div className="relative mt-6">
            {/* 갈라지는 효과를 위한 그라디언트 */}
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-transparent via-green-50 to-white pointer-events-none"></div>
            
            {/* 테이블 컨테이너 */}
            <div className="relative bg-white border-2 border-green-200 rounded-lg shadow-lg">
              <ContentExcelTable projectId={projectId} />
            </div>
          </div>
        </div>
      </div>

      {/* Task Checker Section with Layout Toggle */}
      <div className="mt-6 px-4 w-full">
        <TaskCheckerToggle projectId={projectId} />
      </div>

    </div>
  );
};

export default ProjectDetailsView;