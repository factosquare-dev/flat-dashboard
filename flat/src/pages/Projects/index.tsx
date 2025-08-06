import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import ProjectList from '@/features/projects/components/ProjectList';
import ScheduleTableView from '@/components/Schedule/components/ScheduleTableView';
import type { Project } from '@/types/project';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  useEffect(() => {
    const view = searchParams.get('view');
    const projectId = searchParams.get('projectId');
    
    if (view === 'table') {
      setViewMode('table');
      if (projectId) {
        setSelectedProjectId(projectId);
      }
    } else {
      setViewMode('list');
    }
  }, [searchParams]);
  
  const handleSelectProject = useCallback((project: Project) => {
    // Navigate to table view with project ID
    navigate(`/projects?view=table&projectId=${project.id}`);
  }, [navigate]);

  const handleBackToList = () => {
    navigate('/projects');
  };

  // Show TableView or ProjectList based on view mode
  if (viewMode === 'table') {
    return (
      <div className="h-full">
        <div className="p-4 border-b border-gray-200 bg-white">
          <button
            onClick={handleBackToList}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← 프로젝트 목록으로 돌아가기
          </button>
        </div>
        <ScheduleTableView projectId={selectedProjectId || undefined} />
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <ProjectList onSelectProject={handleSelectProject} />
    </div>
  );
};

export default Projects;