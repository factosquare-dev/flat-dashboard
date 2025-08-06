import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProjectList from '@/features/projects/components/ProjectList';
import type { Project } from '@/types/project';

const Projects: React.FC = () => {
  // 임시 에러 - 나중에 제거
  throw new Error('Projects 페이지는 현재 점검 중입니다. 잠시 후 다시 이용해주세요.');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleSelectProject = useCallback((project: Project) => {
    // Navigate to project detail or schedule view
    // For now, just log the selection
    console.log('Selected project:', project);
    // navigate(`/projects/${project.id}`);
  }, [navigate]);

  // If accessing from /samples, show ProjectList
  if (location.pathname === '/samples') {
    // 임시 에러 - 나중에 제거
    throw new Error('Samples 페이지는 현재 점검 중입니다. 잠시 후 다시 이용해주세요.');
    
    return (
      <div className="h-full">
        <ProjectList onSelectProject={handleSelectProject} />
      </div>
    );
  }

  // Otherwise, show maintenance message
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#dc3545' }}>🚧</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#343a40' }}>Projects Under Maintenance</h2>
      <p style={{ fontSize: '1rem', color: '#6c757d', textAlign: 'center', maxWidth: '600px' }}>
        We are currently refactoring the projects module to improve performance and maintainability.
        <br />
        Please check back later.
      </p>
      <p style={{ fontSize: '0.8rem', color: '#adb5bd', marginTop: '2rem' }}>
        Expected completion: Soon™
      </p>
    </div>
  );
};

export default Projects;