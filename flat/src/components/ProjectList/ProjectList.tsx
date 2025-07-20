import React, { useState, useEffect } from 'react';
import type { Project } from '../../types/project';
import { useProjects } from '../../hooks/useProjects';
import { useProjectFilters } from '../../hooks/useProjectFilters';
import ProjectActions from './ProjectActions';
import ProjectTableSection from './ProjectTableSection';
import ProjectModals from './ProjectModals';

interface ProjectListProps {
  onSelectProject: (project: Project) => void;
  className?: string;
}

const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject, className = '' }) => {
  const projectsHook = useProjects();
  const filtersHook = useProjectFilters();
  
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [containerStyle, setContainerStyle] = useState<{ top: string; left: string }>({ top: '64px', left: '256px' });

  useEffect(() => {
    let rafId: number | null = null;
    
    const calculateMargins = () => {
      if (rafId) return;
      
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const header = document.querySelector('header') || document.querySelector('[role="banner"]') || document.querySelector('.header') || document.querySelector('nav');
        const headerHeight = header ? header.getBoundingClientRect().height : 64;
        
        const sidebarSelectors = [
          '.flex-1.flex.flex-col.overflow-y-auto',
          'aside',
          '[role="navigation"]',
          '.sidebar',
          '[data-sidebar]',
          '.side-nav',
          '.navigation',
          '#sidebar'
        ];
        
        let sidebar = null;
        for (const selector of sidebarSelectors) {
          sidebar = document.querySelector(selector);
          if (sidebar) break;
        }
        
        let sidebarWidth = 256;
        if (sidebar) {
          const rect = sidebar.getBoundingClientRect();
          sidebarWidth = rect.width;
        }
        
        setContainerStyle({
          top: `${headerHeight}px`,
          left: `${sidebarWidth}px`
        });
      });
    };
    
    calculateMargins();
    window.addEventListener('resize', calculateMargins);
    const interval = setInterval(calculateMargins, 500);
    
    setTimeout(() => {
      const sidebar = document.querySelector('.flex-1.flex.flex-col.overflow-y-auto');
      if (sidebar) {
        sidebar.addEventListener('transitionstart', calculateMargins);
        sidebar.addEventListener('transitionend', calculateMargins);
      }
    }, 500);
    
    const observer = new MutationObserver(calculateMargins);
    const sidebar = document.querySelector('aside') || document.querySelector('[role="navigation"]') || document.querySelector('.sidebar');
    if (sidebar && sidebar.parentElement) {
      observer.observe(sidebar, { 
        attributes: true, 
        attributeFilter: ['class', 'style', 'data-collapsed'],
        subtree: true 
      });
    }
    
    return () => {
      window.removeEventListener('resize', calculateMargins);
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  const filteredProjects = filtersHook.getFilteredAndSortedProjects(projectsHook.projects);

  const handleCreateProject = () => {
    setModalMode('create');
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (projectId: string) => {
    const project = projectsHook.projects.find(p => p.id === projectId);
    if (project) {
      setModalMode('edit');
      setEditingProject(project);
      setShowProjectModal(true);
    }
  };

  const handleSaveProject = (projectData: Partial<Project>) => {
    if (modalMode === 'edit' && editingProject) {
      projectsHook.setProjects(
        projectsHook.projects.map(p => 
          p.id === editingProject.id ? { ...p, ...projectData } : p
        )
      );
    } else {
      projectsHook.addProject(projectData);
    }
    setShowProjectModal(false);
    setEditingProject(null);
  };

  const handleSendEmail = () => {
    setShowEmailModal(true);
  };

  const handleEmailSent = () => {
    setShowEmailModal(false);
    projectsHook.setSelectedRows([]);
  };

  return (
    <>
    <div className={`fixed inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 overflow-hidden ${className}`}>
      <div 
        className="absolute bg-white overflow-hidden p-6"
        style={{
          top: containerStyle.top,
          left: containerStyle.left,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="flex-shrink-0 mb-4 w-full">
          <ProjectActions
            selectedPriority={filtersHook.selectedPriority}
            selectedServiceType={filtersHook.selectedServiceType}
            statusFilters={filtersHook.statusFilters}
            searchValue={filtersHook.searchValue}
            totalProjects={projectsHook.projects.length}
            onPriorityChange={filtersHook.setSelectedPriority}
            onServiceTypeChange={filtersHook.setSelectedServiceType}
            onStatusFilterToggle={filtersHook.handleStatusFilterToggle}
            onSearchChange={filtersHook.setSearchValue}
            onCreateProject={handleCreateProject}
            onSendEmail={handleSendEmail}
          />
        </div>
        
        <div className="flex-1 min-h-0 flex flex-col w-full">
          <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
            <ProjectTableSection
              projects={filteredProjects}
              selectedRows={projectsHook.selectedRows}
              sortField={filtersHook.sortField}
              sortDirection={filtersHook.sortDirection}
              isLoading={projectsHook.isLoading}
              hasMore={projectsHook.hasMore}
              onSort={filtersHook.handleSort}
              onSelectAll={projectsHook.handleSelectAll}
              onSelectRow={projectsHook.handleSelectRow}
              onSelectProject={onSelectProject}
              onUpdateProject={projectsHook.updateProject}
              onEditProject={handleEditProject}
              onDeleteProject={projectsHook.deleteProject}
              onLoadMore={projectsHook.loadMoreProjects}
            />
          </div>
        </div>
      </div>
    </div>
    
    <ProjectModals
      showEmailModal={showEmailModal}
      showProjectModal={showProjectModal}
      modalMode={modalMode}
      editingProject={editingProject}
      availableFactories={projectsHook.getSelectedFactories()}
      onCloseEmailModal={() => setShowEmailModal(false)}
      onCloseProjectModal={() => setShowProjectModal(false)}
      onSaveProject={handleSaveProject}
      onSendEmail={handleEmailSent}
    />
    </>
  );
};

export default ProjectList;