import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectDetailsView from '@/components/ProjectDetailsView';
import { ArrowLeft } from 'lucide-react';
import { mockDataService } from '@/core/services/mockDataService';
import { ProjectType } from '@/shared/types/enums';
import { getProductLabel } from '@/shared/utils/productTypeUtils';

const SubProjectDetail: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Get the SUB project details
  const subProject = React.useMemo(() => {
    if (!projectId) return null;
    return mockDataService.getProjectById(projectId);
  }, [projectId]);

  // Get parent project to show navigation context
  const parentProject = React.useMemo(() => {
    if (!subProject?.parentId) return null;
    return mockDataService.getProjectById(subProject.parentId);
  }, [subProject?.parentId]);

  const handleBack = () => {
    // Always go to projects list
    navigate('/projects');
  };

  if (!subProject) {
    return (
      <div className="min-h-screen p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-center text-gray-500">SUB 프로젝트를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  if (subProject.type !== ProjectType.SUB) {
    return (
      <div className="min-h-screen p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-center text-gray-500">이 프로젝트는 SUB 프로젝트가 아닙니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with back button and project info */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="relative w-full">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            프로젝트 목록으로 돌아가기
          </button>
          
          {/* Project Title - Centered */}
          <div className="flex items-center justify-center w-full">
            <span className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-full">
              {getProductLabel([subProject], subProject, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="p-6">
        <ProjectDetailsView 
          projectId={projectId} 
          selectedProjectIndex={0}
          hideHeader={true}
        />
      </div>
    </div>
  );
};

export default SubProjectDetail;