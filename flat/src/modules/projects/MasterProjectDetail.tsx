import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectDetailsView from '@/components/ProjectDetailsView';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductLabel } from '@/shared/utils/productTypeUtils';
import { useMasterProjectDetail } from './hooks/useMasterProjectDetail';

const MasterProjectDetail: React.FC = () => {
  const { projectId } = useParams();
  
  const {
    // Project data
    subProjects,
    selectedProjectIndex,
    
    // Pagination data
    showPagination,
    currentPageIndex,
    totalPages,
    displayProjects,
    itemsPerPage,
    
    // Save confirmation state
    hasUnsavedChanges,
    showSaveDialog,
    pendingProjectIndex,
    
    // Handlers
    handleBack,
    handlePrevious,
    handleNext,
    handleSelectProject,
    setHasUnsavedChanges,
    handleSaveAndSwitch,
    handleDiscardAndSwitch,
    handleCancelSwitch,
  } = useMasterProjectDetail(projectId);

  return (
    <div className="min-h-screen">
      {/* Header with back button and product selector */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="relative w-full">
          {/* Back to List Button */}
          <button
            onClick={handleBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            프로젝트 목록으로 돌아가기
          </button>
          
          {/* Product Type Selector with conditional pagination - Centered to viewport */}
          {subProjects.length > 0 && (
            <div className="flex items-center justify-center w-full">
              <div className="flex items-center justify-center overflow-hidden">
                {showPagination && (
                  <button
                    onClick={handlePrevious}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous"
                    disabled={currentPageIndex === 0}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                
                <div className={`flex gap-1 lg:gap-2 ${showPagination ? 'mx-1 lg:mx-2' : ''} overflow-x-auto`}>
                  {displayProjects.map((project, idx) => {
                    const absoluteIndex = showPagination 
                      ? currentPageIndex * itemsPerPage + idx 
                      : idx;
                    return (
                      <div
                        key={project.id}
                        onClick={() => handleSelectProject(absoluteIndex)}
                        className={`px-2 lg:px-3 py-1 lg:py-1.5 border-2 rounded-lg font-medium cursor-pointer transition-colors text-xs lg:text-sm whitespace-nowrap ${
                          selectedProjectIndex === absoluteIndex
                            ? 'bg-blue-100 border-blue-500 text-blue-900'
                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {getProductLabel(subProjects, project, absoluteIndex)}
                      </div>
                    );
                  })}
                </div>
                
                {showPagination && (
                  <button
                    onClick={handleNext}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next"
                    disabled={currentPageIndex === totalPages - 1}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Details */}
      <div className="p-6">
        <ProjectDetailsView 
          projectId={projectId} 
          selectedProjectIndex={selectedProjectIndex}
          onProjectSelect={handleSelectProject}
          hideHeader={true}
          onFormChange={setHasUnsavedChanges}
        />
      </div>

      {/* Save Confirmation Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              편집 중인 내용이 있습니다
            </h3>
            <p className="text-gray-600 mb-6">
              현재 제품개발의뢰서에 저장되지 않은 변경사항이 있습니다. 어떻게 하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSaveAndSwitch}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                저장 후 이동
              </button>
              <button
                onClick={handleDiscardAndSwitch}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                저장하지 않고 이동
              </button>
              <button
                onClick={handleCancelSwitch}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterProjectDetail;