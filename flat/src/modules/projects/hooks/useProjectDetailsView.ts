import { useState, useEffect } from 'react';
import { mockDataService } from '@/core/services/mockDataService';
import { ProjectType } from '@/shared/types/enums';
import type { Project } from '@/shared/types/project';

interface UseProjectDetailsViewProps {
  projectId?: string;
  selectedProjectIndex?: number;
  onProjectSelect?: (index: number) => void;
}

/**
 * Business logic hook for ProjectDetailsView component
 * Handles project loading, section management, and form display logic
 */
export const useProjectDetailsView = ({
  projectId,
  selectedProjectIndex: externalSelectedIndex,
  onProjectSelect
}: UseProjectDetailsViewProps) => {
  // Project state
  const [subProjects, setSubProjects] = useState<Project[]>([]);
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(0);
  
  // Section state
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showContentTable, setShowContentTable] = useState(false);

  // Determine which index to use (external vs internal)
  const selectedProjectIndex = externalSelectedIndex !== undefined ? externalSelectedIndex : internalSelectedIndex;

  // Load SUB projects for this master project OR single project if it's a SUB project
  useEffect(() => {
    if (projectId) {
      const project = mockDataService.getProjectById(projectId);
      
      if (project?.type === ProjectType.SUB) {
        // For SUB projects, treat as single project
        setSubProjects([project]);
        if (externalSelectedIndex === undefined) {
          setInternalSelectedIndex(0);
        }
      } else {
        // For MASTER projects, get all SUB projects
        const allProjects = mockDataService.getAllProjects();
        const subs = allProjects.filter(
          (p) => p.parentId === projectId && p.type === ProjectType.SUB
        );
        
        setSubProjects(subs);
        if (externalSelectedIndex === undefined) {
          setInternalSelectedIndex(0);
        }
      }
    }
  }, [projectId]);

  // Currently selected SUB project
  const selectedProject = subProjects[selectedProjectIndex];
  
  // Project selection handler
  const handleSelectProject = (absoluteIndex: number) => {
    if (onProjectSelect) {
      onProjectSelect(absoluteIndex);
    } else {
      setInternalSelectedIndex(absoluteIndex);
    }
  };

  // Section toggle handler
  const handleSectionToggle = (section: string) => {
    if (section === 'request') {
      setShowRequestForm(!showRequestForm);
      setShowContentTable(false);
      setExpandedSection(null);
    } else if (section === 'content') {
      setShowContentTable(!showContentTable);
      setShowRequestForm(false);
      setExpandedSection(null);
    } else {
      setExpandedSection(expandedSection === section ? null : section);
      setShowRequestForm(false);
      setShowContentTable(false);
    }
  };

  // Section content renderer helper
  const renderSectionContent = (section: string) => {
    if (!selectedProject || !projectId) return null;

    // Get data from MockDB
    const sectionData = mockDataService.getProjectSectionData(selectedProject.id, section);
    if (!sectionData) return null;

    const sectionConfig = {
      request: {
        title: '제품 개발 의뢰서',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      },
      content: {
        title: '내용물',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      container: {
        title: '용기',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      design: {
        title: '디자인표시문구',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      certification: {
        title: '인증인허가임상',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      }
    };

    const config = sectionConfig[section as keyof typeof sectionConfig];
    if (!config) return null;

    return {
      ...config,
      data: sectionData
    };
  };

  return {
    // Project data
    subProjects,
    selectedProject,
    selectedProjectIndex,
    
    // Section state
    expandedSection,
    showRequestForm,
    showContentTable,
    
    // Handlers
    handleSelectProject,
    handleSectionToggle,
    renderSectionContent,
  };
};