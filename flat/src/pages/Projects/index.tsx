import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import ProjectList from '@/features/projects/components/ProjectList';
import ScheduleTableView from '@/components/Schedule/components/ScheduleTableView';
import FactorySelectionModal from '@/components/FactorySelectionModal';
import type { Project } from '@/types/project';
import type { Factory } from '@/data/factories';
import type { FactoryAssignment } from '@/types/schedule';
import { mockDataService } from '@/services/mockDataService';
import { FactoryType, TaskStatus } from '@/types/enums';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showFactoryModal, setShowFactoryModal] = useState(false);
  
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

  const handleAddFactory = useCallback(() => {
    if (selectedProjectId) {
      setShowFactoryModal(true);
    }
  }, [selectedProjectId]);

  const handleFactoriesSelect = useCallback((factories: Factory[]) => {
    if (!selectedProjectId) return;
    
    // 프로젝트의 모든 태스크 가져오기
    const projectTasks = mockDataService.getTasksByProjectId(selectedProjectId);
    
    if (projectTasks.length === 0) {
      alert('이 프로젝트에 태스크가 없습니다. 먼저 태스크를 추가해주세요.');
      setShowFactoryModal(false);
      return;
    }
    
    // 각 공장을 모든 적절한 태스크에 할당
    factories.forEach(factory => {
      projectTasks.forEach(task => {
        // 이미 할당된지 확인
        const alreadyAssigned = task.factoryAssignments?.some(
          fa => fa.factoryId === factory.id
        );
        
        if (!alreadyAssigned) {
          const newAssignment: FactoryAssignment = {
            factoryId: factory.id,
            factoryName: factory.name,
            factoryType: factory.type as FactoryType,
            role: 'secondary',
            status: task.status || TaskStatus.PENDING,
            progress: task.progress,
            startDate: task.startDate,
            endDate: task.endDate
          };
          
          mockDataService.assignFactoryToTask(task.id, newAssignment);
        }
      });
    });
    
    setShowFactoryModal(false);
    // 화면 새로고침 (임시)
    window.location.reload();
  }, [selectedProjectId]);

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
        <ScheduleTableView 
          projectId={selectedProjectId || undefined}
          onAddFactory={handleAddFactory}
        />
      </div>
    );
  }
  
  return (
    <>
      <div className="h-full">
        <ProjectList onSelectProject={handleSelectProject} />
      </div>
      
      {/* Factory Selection Modal */}
      <FactorySelectionModal
        isOpen={showFactoryModal}
        onClose={() => setShowFactoryModal(false)}
        onSelectFactories={handleFactoriesSelect}
        multiSelect={true}
      />
    </>
  );
};

export default Projects;