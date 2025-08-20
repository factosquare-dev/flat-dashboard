import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectList from './components/ProjectList';
import type { Project } from '@/shared/types/project';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectProject = (project: Project) => {
    navigate(`/projects/master/${project.id}`);
  };

  return (
    <ProjectList onSelectProject={handleSelectProject} />
  );
};

export default ProjectsPage;