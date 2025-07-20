import React, { useState } from 'react';
import type { Project } from '../../types/project';
import { projectFactories } from '../../data/mockData';
import Schedule from '../Schedule';
import ProjectListView from './ProjectList';

interface ProjectListContainerProps {
  className?: string;
}

const ProjectListContainer: React.FC<ProjectListContainerProps> = ({ className = '' }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  if (selectedProject) {
    const participants = projectFactories[selectedProject.id]?.map(factory => ({
      id: factory.name,
      name: factory.name,
      period: `${selectedProject.startDate} ~ ${selectedProject.endDate}`,
      color: factory.color.replace('bg-', '').replace('-500', '')
    })) || [
      { id: selectedProject.manufacturer, name: selectedProject.manufacturer, period: `${selectedProject.startDate} ~ ${selectedProject.endDate}`, color: 'blue' },
      { id: selectedProject.container, name: selectedProject.container, period: `${selectedProject.startDate} ~ ${selectedProject.endDate}`, color: 'red' },
      { id: selectedProject.packaging, name: selectedProject.packaging, period: `${selectedProject.startDate} ~ ${selectedProject.endDate}`, color: 'yellow' }
    ];
    
    return (
      <Schedule
        participants={participants}
        startDate={selectedProject.startDate}
        endDate={selectedProject.endDate}
        onBack={() => setSelectedProject(null)}
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