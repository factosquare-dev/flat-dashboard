import React, { useState, useEffect } from 'react';
import type { Project } from '../../types/project';
import type { Schedule as ScheduleType } from '../../types/schedule';
import { scheduleApi } from '../../api/scheduleApi';
import Schedule from '../Schedule';
import ProjectListView from './ProjectList';
import { ErrorBoundary, ProjectListErrorFallback } from '../../../components/ErrorBoundary';

interface ProjectListContainerProps {
  className?: string;
}

const ProjectListContainer: React.FC<ProjectListContainerProps> = ({ className = '' }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectSchedule, setProjectSchedule] = useState<ScheduleType | null>(null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    if (selectedProject) {
      setIsLoadingSchedule(true);
      setScheduleError(null);
      scheduleApi.getOrCreateScheduleForProject(selectedProject)
        .then(schedule => {
          if (isMounted) {
            setProjectSchedule(schedule);
          }
        })
        .catch(error => {
          if (isMounted) {
            setScheduleError('스케줄을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
            // Error handled silently
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingSchedule(false);
          }
        });
    } else {
      setProjectSchedule(null);
      setScheduleError(null);
    }
    
    return () => {
      isMounted = false;
    };
  }, [selectedProject]);
  
  if (selectedProject) {
    if (scheduleError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold text-red-600 mb-2">오류 발생</h3>
            <p className="text-gray-600 mb-4">{scheduleError}</p>
            <button
              onClick={() => setSelectedProject(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              돌아가기
            </button>
          </div>
        </div>
      );
    }
    
    if (projectSchedule) {
      return (
        <Schedule
          participants={projectSchedule.participants}
          tasks={projectSchedule.tasks}
          startDate={projectSchedule.startDate}
          endDate={projectSchedule.endDate}
          projectName={`${selectedProject.client} - ${selectedProject.productType}`}
          onBack={() => setSelectedProject(null)}
          isLoading={isLoadingSchedule}
        />
      );
    }
  }
  
  return (
    <ErrorBoundary fallback={ProjectListErrorFallback}>
      <ProjectListView
        onSelectProject={setSelectedProject}
        className={className}
      />
    </ErrorBoundary>
  );
};

export default ProjectListContainer;