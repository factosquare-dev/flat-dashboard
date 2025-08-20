import React from 'react';
import { ProductDevelopmentForm } from '@/modules/products/ProductDevelopmentForm';
import { TaskCheckerToggle } from '@/modules/products/components/TaskCheckerToggle';
import { ContentExcelTable } from '@/modules/products/components/ContentExcelTable';
import { getProductLabel } from '@/shared/utils/productTypeUtils';
import { useProjectDetailsView } from '@/modules/projects/hooks/useProjectDetailsView';
import './ProjectDetailsView.css';

interface ProjectDetailsViewProps {
  projectId?: string;
  selectedProjectIndex?: number;
  onProjectSelect?: (index: number) => void;
  hideHeader?: boolean;
  onFormChange?: (hasChanges: boolean) => void;
}

const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({ 
  projectId, 
  selectedProjectIndex: externalSelectedIndex, 
  onProjectSelect,
  hideHeader = false,
  onFormChange
}) => {
  const {
    // Project data
    subProjects,
    selectedProject,
    selectedProjectIndex,
    
    // Section state
    expandedSection,
    showRequestForm,
    showContentTable,
    
    // Handlers
    handleSelectProject,
    handleSectionToggle,
    renderSectionContent,
  } = useProjectDetailsView({
    projectId,
    selectedProjectIndex: externalSelectedIndex,
    onProjectSelect
  });

  // Helper function to render section content using data from the hook
  const renderExpandedSectionContent = (section: string) => {
    const sectionData = renderSectionContent(section);
    if (!sectionData) return null;

    const { title, bgColor, borderColor, data } = sectionData;

    switch (section) {
      case 'request':
        return (
          <div className={`p-6 ${bgColor} rounded-lg`}>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="space-y-3">
              <div className={`bg-white p-4 rounded border ${borderColor}`}>
                <p className="text-sm text-gray-600">의뢰일자: {data.requestDate}</p>
                <p className="text-sm text-gray-600">의뢰내용: {data.content}</p>
                <p className="text-sm text-gray-600">담당자: {data.manager}</p>
              </div>
            </div>
          </div>
        );
      case 'content':
        return (
          <div className={`p-6 ${bgColor} rounded-lg`}>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`bg-white p-4 rounded border ${borderColor}`}>
                <p className="text-sm font-medium">주요 성분</p>
                <p className="text-sm text-gray-600 mt-1">{data.mainIngredients}</p>
              </div>
              <div className={`bg-white p-4 rounded border ${borderColor}`}>
                <p className="text-sm font-medium">용량</p>
                <p className="text-sm text-gray-600 mt-1">{data.volume}</p>
              </div>
            </div>
          </div>
        );
      case 'container':
        return (
          <div className={`p-6 ${bgColor} rounded-lg`}>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className={`bg-white p-4 rounded border ${borderColor}`}>
                <p className="text-sm font-medium">용기 타입</p>
                <p className="text-sm text-gray-600 mt-1">{data.containerType}</p>
              </div>
              <div className={`bg-white p-4 rounded border ${borderColor}`}>
                <p className="text-sm font-medium">재질</p>
                <p className="text-sm text-gray-600 mt-1">{data.material}</p>
              </div>
              <div className={`bg-white p-4 rounded border ${borderColor}`}>
                <p className="text-sm font-medium">색상</p>
                <p className="text-sm text-gray-600 mt-1">{data.color}</p>
              </div>
            </div>
          </div>
        );
      case 'design':
        return (
          <div className={`p-6 ${bgColor} rounded-lg`}>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="space-y-3">
              <div className={`bg-white p-4 rounded border ${borderColor}`}>
                <p className="text-sm font-medium">제품명</p>
                <p className="text-sm text-gray-600 mt-1">{data.productName}</p>
              </div>
              <div className={`bg-white p-4 rounded border ${borderColor}`}>
                <p className="text-sm font-medium">표시사항</p>
                <p className="text-sm text-gray-600 mt-1">{data.labelInfo}</p>
              </div>
            </div>
          </div>
        );
      case 'certification':
        return (
          <div className={`p-6 ${bgColor} rounded-lg`}>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`bg-white p-4 rounded border ${borderColor}`}>
                <p className="text-sm font-medium">인증 상태</p>
                <p className="text-sm text-gray-600 mt-1">{data.status}</p>
              </div>
              <div className={`bg-white p-4 rounded border ${borderColor}`}>
                <p className="text-sm font-medium">예상 완료일</p>
                <p className="text-sm text-gray-600 mt-1">{data.expectedCompletion}</p>
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
    <div className="project-details-container mobile-overflow-fix">

      {/* Project Detail Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        {selectedProject && (
          <div className="p-6">
            {/* Header with Product Type */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">프로젝트 상세 정보</h2>
              <span className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
                {getProductLabel(subProjects, selectedProject, selectedProjectIndex)}
              </span>
            </div>
            
            {/* Project Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {/* Left Column */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 min-w-[80px] flex-shrink-0 font-medium">기간</span>
                  <span className="font-medium text-gray-900">
                    {selectedProject.startDate ? (selectedProject.startDate instanceof Date ? selectedProject.startDate.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) : new Date(selectedProject.startDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })) : '-'}
                    ~
                    {selectedProject.endDate ? (selectedProject.endDate instanceof Date ? selectedProject.endDate.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) : new Date(selectedProject.endDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })) : '-'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 lg:gap-2">
                  <span className="text-gray-600 text-xs lg:text-sm min-w-[40px] lg:min-w-[60px] flex-shrink-0">수출국가</span>
                  <span className={`font-medium text-xs lg:text-sm truncate ${selectedProject.exportCountry ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedProject.exportCountry || '미정'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 lg:gap-2">
                  <span className="text-gray-600 text-xs lg:text-sm min-w-[40px] lg:min-w-[60px] flex-shrink-0">용량</span>
                  <span className={`font-medium text-xs lg:text-sm truncate ${selectedProject.product?.capacity ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedProject.product?.capacity || '미정'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 lg:gap-2">
                  <span className="text-gray-600 text-xs lg:text-sm min-w-[40px] lg:min-w-[60px] flex-shrink-0">기능성</span>
                  <span className={`font-medium text-xs lg:text-sm truncate ${selectedProject.product?.functionality ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedProject.product?.functionality || '미정'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 lg:gap-2">
                  <span className="text-gray-600 text-xs lg:text-sm min-w-[40px] lg:min-w-[60px] flex-shrink-0">수량</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 font-semibold rounded text-sm">
                    {selectedProject.quantity?.toLocaleString() || 0}개
                  </span>
                </div>
                
                <div className="flex items-center gap-1 lg:gap-2">
                  <span className="text-gray-600 text-xs lg:text-sm min-w-[40px] lg:min-w-[60px] flex-shrink-0">포장</span>
                  <span className={`font-medium text-xs lg:text-sm truncate ${selectedProject.packagingSpec ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedProject.packagingSpec || '미정'}
                  </span>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 lg:gap-2">
                  <span className="text-gray-600 text-xs lg:text-sm min-w-[40px] lg:min-w-[60px] flex-shrink-0">공장</span>
                  <span className={`font-medium text-xs lg:text-sm truncate ${selectedProject.factories?.[0]?.name ? 'text-blue-600' : 'text-gray-400'}`}>
                    {selectedProject.factories?.[0]?.name || '미정'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 lg:gap-2">
                  <span className="text-gray-600 text-xs lg:text-sm min-w-[40px] lg:min-w-[60px] flex-shrink-0">인증</span>
                  <span className={`font-medium text-xs lg:text-sm truncate ${selectedProject.certification ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedProject.certification || '미정'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 lg:gap-2">
                  <span className="text-gray-600 text-xs lg:text-sm min-w-[40px] lg:min-w-[60px] flex-shrink-0">부자재</span>
                  <span className={`font-medium text-xs lg:text-sm truncate ${selectedProject.subsidiaryMaterials ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedProject.subsidiaryMaterials || '미정'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 lg:gap-2">
                  <span className="text-gray-600 text-xs lg:text-sm min-w-[40px] lg:min-w-[60px] flex-shrink-0">랩넘버</span>
                  <span className={`px-2 py-0.5 bg-purple-100 text-purple-700 font-mono font-semibold rounded text-xs ${!selectedProject.labNumber && 'opacity-50'}`}>
                    {selectedProject.labNumber || 'PENDING'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 lg:gap-2">
                  <span className="text-gray-600 text-xs lg:text-sm min-w-[40px] lg:min-w-[60px] flex-shrink-0">상태</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-semibold rounded text-sm">
                      {selectedProject.status || '진행중'}
                    </span>
                    {selectedProject.progress !== undefined && (
                      <span className="text-gray-600 font-medium text-sm">{selectedProject.progress}%</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 lg:gap-2">
                  <span className="text-gray-600 text-xs lg:text-sm min-w-[40px] lg:min-w-[60px] flex-shrink-0">담당자</span>
                  <span className="font-medium text-gray-900 text-xs lg:text-sm truncate">
                    {selectedProject.assignee || '미배정'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 lg:mt-6 px-2 lg:px-4">
        <div className="flex flex-wrap justify-center gap-2 lg:gap-3 button-group-responsive">
          <button 
            onClick={() => handleSectionToggle('request')}
            className={`px-3 lg:px-4 py-1.5 lg:py-2 border text-xs lg:text-sm font-medium rounded-lg transition-all ${
              showRequestForm 
                ? 'bg-gray-700 text-white border-gray-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            제품 개발 의뢰서
          </button>
          <button 
            onClick={() => handleSectionToggle('content')}
            className={`px-3 lg:px-4 py-1.5 lg:py-2 border text-xs lg:text-sm font-medium rounded-lg transition-all ${
              showContentTable 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            내용물
          </button>
          <button 
            onClick={() => handleSectionToggle('container')}
            className={`px-3 lg:px-4 py-1.5 lg:py-2 border text-xs lg:text-sm font-medium rounded-lg transition-all ${
              expandedSection === 'container' 
                ? 'bg-green-600 text-white border-green-600' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            용기
          </button>
          <button 
            onClick={() => handleSectionToggle('design')}
            className={`px-3 lg:px-4 py-1.5 lg:py-2 border text-xs lg:text-sm font-medium rounded-lg transition-all ${
              expandedSection === 'design' 
                ? 'bg-purple-600 text-white border-purple-600' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            디자인표시문구
          </button>
          <button 
            onClick={() => handleSectionToggle('certification')}
            className={`px-3 lg:px-4 py-1.5 lg:py-2 border text-xs lg:text-sm font-medium rounded-lg transition-all ${
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
          {expandedSection && renderExpandedSectionContent(expandedSection)}
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
              <ProductDevelopmentForm 
                projectId={projectId}
                selectedProjectIndex={selectedProjectIndex}
                onFormChange={onFormChange}
              />
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