import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProjectList from '@/features/projects/components/ProjectList';
import type { Project } from '@/types/project';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleSelectProject = useCallback((project: Project) => {
    // Navigate to project detail or schedule view
    // For now, just log the selection
    console.log('Selected project:', project);
    // navigate(`/projects/${project.id}`);
  }, [navigate]);

  // Show ProjectList for both /projects and /samples routes
  return (
    <div className="h-full">
      <ProjectList onSelectProject={handleSelectProject} />
    </div>
  );
};

export default Projects;