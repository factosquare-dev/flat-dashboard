import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectDetailsView from '@/components/ProjectDetailsView';
import { ArrowLeft } from 'lucide-react';

const MasterProjectDetail: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/projects');
  };

  return (
    <div className="min-h-screen">
      {/* Header with back button */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          프로젝트 목록으로 돌아가기
        </button>
      </div>

      {/* Project Details */}
      <div className="p-6">
        <ProjectDetailsView projectId={projectId} />
      </div>
    </div>
  );
};

export default MasterProjectDetail;