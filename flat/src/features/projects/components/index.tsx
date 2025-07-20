import React, { useState, useEffect } from 'react';
import type { Project } from '../../types/project';
import type { Schedule as ScheduleType } from '../../types/schedule';
import { scheduleApi } from '../../api/scheduleApi';
import Schedule from '../Schedule';
import ProjectListView from './ProjectList';

interface ProjectListContainerProps {
  className?: string;
}

const ProjectListContainer: React.FC<ProjectListContainerProps> = ({ className = '' }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectSchedule, setProjectSchedule] = useState<ScheduleType | null>(null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  
  useEffect(() => {
    if (selectedProject) {
      setIsLoadingSchedule(true);
      scheduleApi.getOrCreateScheduleForProject(selectedProject)
        .then(schedule => {
          setProjectSchedule(schedule);
        })
        .catch(error => {
          console.error('Failed to load schedule:', error);
        })
        .finally(() => {
          setIsLoadingSchedule(false);
        });
    } else {
      setProjectSchedule(null);
    }
  }, [selectedProject]);
  
  if (selectedProject && projectSchedule) {
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
  
  return (
    <ProjectListView
      onSelectProject={setSelectedProject}
      className={className}
    />
  );
};

export default ProjectListContainer;