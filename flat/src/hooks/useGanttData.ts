import { useState, useCallback, useMemo } from 'react';
import type { Project } from '../components/GanttChart/types';
import { getGanttMockProjects } from '../data/ganttMockData';

export const useGanttData = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    console.log('[useGanttData] 🚨 Initializing with getGanttMockProjects...');
    const initialProjects = getGanttMockProjects();
    console.log('[useGanttData] 🚨 Initial projects:', initialProjects);
    console.log('[useGanttData] 🚨 Initial project names:', initialProjects.map(p => p.name));
    return initialProjects;
  });

  // Calculate total rows for grid layout - memoized for performance
  const totalRows = useMemo(() => {
    return projects.reduce((sum, project) => {
      return sum + 1 + (project.expanded ? project.tasks.length : 0);
    }, 0);
  }, [projects]);

  // Toggle project expansion - optimized for performance
  const toggleProject = useCallback((projectId: string) => {
    setProjects(prev => {
      const projectIndex = prev.findIndex(p => p.id === projectId);
      if (projectIndex === -1) return prev;

      const newProjects = [...prev];
      newProjects[projectIndex] = {
        ...newProjects[projectIndex],
        expanded: !newProjects[projectIndex].expanded
      };
      return newProjects;
    });
  }, []);

  // Add new project
  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: `project-${Date.now()}`,
      expanded: true
    };
    setProjects(prev => [...prev, newProject]);
  }, []);

  // Update project
  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, ...updates }
        : project
    ));
  }, []);

  // Delete project
  const deleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  }, []);

  // Add task to project  
  const addTask = useCallback((projectId: string, task: Omit<any, 'id' | 'projectId'>) => {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      projectId
    };
    
    setProjects(prev => prev.map(project => 
      project.id === projectId
        ? { ...project, tasks: [...project.tasks, newTask] }
        : project
    ));
  }, []);

  // Update task
  const updateTask = useCallback((taskId: string | number, updates: any) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      tasks: project.tasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates }
          : task
      )
    })));
  }, []);

  // Delete task
  const deleteTask = useCallback((taskId: string | number) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      tasks: project.tasks.filter(task => task.id !== taskId)
    })));
  }, []);

  // Refresh projects from mock data (for resetMockData)
  const refreshProjects = useCallback(() => {
    console.log('[useGanttData] Refreshing projects from mock data...');
    setProjects(getGanttMockProjects());
  }, []);

  return {
    projects,
    setProjects,
    totalRows,
    toggleProject,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    refreshProjects
  };
};