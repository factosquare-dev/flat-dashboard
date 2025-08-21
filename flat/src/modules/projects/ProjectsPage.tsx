import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectList from './components/ProjectList';
import type { Project } from '@/shared/types/project';
import { ProjectType } from '@/shared/types/enums';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectProject = (project: Project) => {
    // Navigate to the appropriate detail page based on project type
    switch (project.type) {
      case ProjectType.MASTER:
        navigate(`/projects/master/${project.id}`);
        break;
      case ProjectType.SUB:
        navigate(`/projects/sub/${project.id}`);
        break;
      case ProjectType.INDEPENDENT:
        navigate(`/projects/independent/${project.id}`);
        break;
      default:
        // Fallback to master for unknown types
        navigate(`/projects/master/${project.id}`);
    }
  };

  return (
    <ProjectList onSelectProject={handleSelectProject} />
  );
};

export default ProjectsPage;