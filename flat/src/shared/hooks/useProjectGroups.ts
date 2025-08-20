import { useState, useCallback, useEffect } from 'react';
import type { Project } from '@/shared/types/project';

interface ProjectGroup {
  id: string;
  name: string;
  projectIds: string[];
  isExpanded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'flat-project-groups';

export const useProjectGroups = () => {
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Load groups from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setGroups(parsed.map((g: any) => ({
          ...g,
          createdAt: new Date(g.createdAt),
          updatedAt: new Date(g.updatedAt)
        })));
      } catch (error) {
        console.error('Failed to load project groups:', error);
      }
    }
  }, []);

  // Save groups to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

  // Create a new group
  const createGroup = useCallback((name: string, projectIds: string[] = []) => {
    const newGroup: ProjectGroup = {
      id: `group-${Date.now()}`,
      name,
      projectIds,
      isExpanded: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setGroups(prev => [...prev, newGroup]);
    return newGroup.id;
  }, []);

  // Add projects to a group
  const addProjectsToGroup = useCallback((groupId: string, projectIds: string[]) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const uniqueProjectIds = Array.from(new Set([...group.projectIds, ...projectIds]));
        return {
          ...group,
          projectIds: uniqueProjectIds,
          updatedAt: new Date()
        };
      }
      return group;
    }));
  }, []);

  // Remove projects from a group
  const removeProjectsFromGroup = useCallback((groupId: string, projectIds: string[]) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          projectIds: group.projectIds.filter(id => !projectIds.includes(id)),
          updatedAt: new Date()
        };
      }
      return group;
    }));
  }, []);

  // Delete a group
  const deleteGroup = useCallback((groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
    if (selectedGroupId === groupId) {
      setSelectedGroupId(null);
    }
  }, [selectedGroupId]);

  // Rename a group
  const renameGroup = useCallback((groupId: string, newName: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          name: newName,
          updatedAt: new Date()
        };
      }
      return group;
    }));
  }, []);

  // Toggle group expansion
  const toggleGroupExpansion = useCallback((groupId: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          isExpanded: !group.isExpanded
        };
      }
      return group;
    }));
  }, []);

  // Move projects between groups
  const moveProjectsBetweenGroups = useCallback((projectIds: string[], fromGroupId: string | null, toGroupId: string | null) => {
    setGroups(prev => {
      let updated = [...prev];
      
      // Remove from source group
      if (fromGroupId) {
        updated = updated.map(group => {
          if (group.id === fromGroupId) {
            return {
              ...group,
              projectIds: group.projectIds.filter(id => !projectIds.includes(id)),
              updatedAt: new Date()
            };
          }
          return group;
        });
      }
      
      // Add to target group
      if (toGroupId) {
        updated = updated.map(group => {
          if (group.id === toGroupId) {
            const uniqueProjectIds = Array.from(new Set([...group.projectIds, ...projectIds]));
            return {
              ...group,
              projectIds: uniqueProjectIds,
              updatedAt: new Date()
            };
          }
          return group;
        });
      }
      
      return updated;
    });
  }, []);

  // Get group by project ID
  const getGroupByProjectId = useCallback((projectId: string): ProjectGroup | null => {
    return groups.find(group => group.projectIds.includes(projectId)) || null;
  }, [groups]);

  // Get ungrouped projects
  const getUngroupedProjects = useCallback((allProjects: Project[]): Project[] => {
    const groupedProjectIds = new Set(groups.flatMap(g => g.projectIds));
    return allProjects.filter(p => !groupedProjectIds.has(p.id));
  }, [groups]);

  return {
    groups,
    selectedGroupId,
    setSelectedGroupId,
    createGroup,
    addProjectsToGroup,
    removeProjectsFromGroup,
    deleteGroup,
    renameGroup,
    toggleGroupExpansion,
    moveProjectsBetweenGroups,
    getGroupByProjectId,
    getUngroupedProjects
  };
};