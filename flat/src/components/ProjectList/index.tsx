import React, { useState, useEffect, useCallback } from 'react';
import type { Project } from '../../types/project';
import type { Schedule as ScheduleType } from '../../types/schedule';
import { useTaskStore } from '../../stores/taskStore';
import Schedule from '../Schedule';
import ProjectListView from '../../features/projects/components/ProjectList';
import { ErrorBoundary, ProjectListErrorFallback } from '../ErrorBoundary';
import { LoadingState } from '../loading/LoadingState';
import { EmptyState } from '../common';
import { Calendar } from 'lucide-react';

interface ProjectListContainerProps {
  className?: string;
}

const ProjectListContainer = React.memo<ProjectListContainerProps>(({ className = '' }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectSchedule, setProjectSchedule] = useState<ScheduleType | null>(null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  
  // Use taskStore for unified data management
  const { loadScheduleForProject, getScheduleForProject, isLoading: storeLoading } = useTaskStore();
  
  const handleBack = useCallback(() => {
    setSelectedProject(null);
    setProjectSchedule(null);
    setScheduleError(null);
  }, []);
  
  useEffect(() => {
    let isMounted = true;
    
    if (selectedProject) {
      setIsLoadingSchedule(true);
      setScheduleError(null);
      
      // First try to get from store
      const existingSchedule = getScheduleForProject(selectedProject.id);
      if (existingSchedule) {
        setProjectSchedule(existingSchedule);
        setIsLoadingSchedule(false);
      } else {
        // Load from API and update store
        loadScheduleForProject(selectedProject)
          .then(schedule => {
            if (isMounted) {
              setProjectSchedule(schedule);
            }
          })
          .catch(() => {
            if (isMounted) {
              setScheduleError('스케줄을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
          })
          .finally(() => {
            if (isMounted) {
              setIsLoadingSchedule(false);
            }
          });
      }
    } else {
      setProjectSchedule(null);
      setScheduleError(null);
    }
    
    return () => {
      isMounted = false;
    };
  }, [selectedProject, loadScheduleForProject, getScheduleForProject]);
  
  if (selectedProject) {
    if (scheduleError) {
      return (
        <EmptyState
          icon={<Calendar />}
          title="오류 발생"
          description={scheduleError}
          action={{
            label: '돌아가기',
            onClick: handleBack
          }}
        />
      );
    }
    
    return (
      <LoadingState
        isLoading={isLoadingSchedule || storeLoading}
        error={scheduleError}
        isEmpty={!projectSchedule}
        emptyComponent={
          <EmptyState
            icon={<Calendar />}
            title="스케줄 정보 없음"
            description="해당 프로젝트의 스케줄 정보가 없습니다."
            action={{
              label: '돌아가기',
              onClick: handleBack
            }}
          />
        }
      >
        {projectSchedule && (
          <Schedule
            participants={projectSchedule.factories ?? []}
            tasks={projectSchedule.tasks}
            startDate={projectSchedule.startDate}
            endDate={projectSchedule.endDate}
            projectName={`${selectedProject.client} - ${selectedProject.productType}`}
            projectId={selectedProject.id}
            onBack={handleBack}
            isLoading={isLoadingSchedule || storeLoading}
          />
        )}
      </LoadingState>
    );
  }
  
  return (
    <ErrorBoundary fallback={ProjectListErrorFallback}>
      <ProjectListView
        onSelectProject={setSelectedProject}
        className={className}
      />
    </ErrorBoundary>
  );
});

export default ProjectListContainer;