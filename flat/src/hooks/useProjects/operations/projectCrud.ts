/**
 * Project CRUD operations
 */

import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';
import { ProjectField } from '@/types/enums';
import { isProjectType } from '@/utils/projectTypeUtils';
import { factories } from '@/data/factories';
import { formatCompanyNameForDisplay } from '@/utils/companyUtils';

const mockDb = MockDatabaseImpl.getInstance();

// Define factory ID fields for projects
const FACTORY_ID_FIELDS = ['manufacturerId', 'containerId', 'packagingId'] as const;

// Define date fields for projects
const DATE_FIELDS = ['startDate', 'endDate', 'createdAt', 'updatedAt'] as const;

/**
 * Update a single project field
 */
export const updateProjectField = async <K extends keyof Project>(
  projectId: ProjectId,
  field: K,
  value: Project[K],
  projects: Project[],
  onUpdate?: (projects: Project[]) => void
): Promise<Project[]> => {
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) return projects;

  const project = projects[projectIndex];
  let updatedProject = { ...project };

  // Handle factory ID fields specially
  if ((FACTORY_ID_FIELDS as ReadonlyArray<string>).includes(field as string)) {
    const factoryIdField = field as typeof FACTORY_ID_FIELDS[number];
    const factoryNameField = getFactoryNameField(factoryIdField);
    
    if (factoryNameField) {
      updatedProject[factoryIdField] = value as any;
      updatedProject[factoryNameField] = value ? getFactoryNames(value as string | string[]) : undefined;
    }
  } 
  // Handle date fields with proper serialization
  else if ((DATE_FIELDS as ReadonlyArray<string>).includes(field as string)) {
    const dateValue = value as string | Date;
    updatedProject[field] = (dateValue instanceof Date ? dateValue.toISOString() : dateValue) as any;
  }
  // Handle regular fields
  else {
    updatedProject[field] = value;
  }

  // For customer field, ensure displayName is set
  if (field === ProjectField.CUSTOMER && value && typeof value === 'object' && 'company' in value) {
    const customer = value as any;
    if (customer.company) {
      customer.displayName = formatCompanyNameForDisplay(customer.company);
    }
  }

  // Update in MockDB
  try {
    const updateData: Partial<Project> = { [field]: value };
    
    // Include factory name updates if it's a factory ID field
    if ((FACTORY_ID_FIELDS as ReadonlyArray<string>).includes(field as string)) {
      const factoryNameField = getFactoryNameField(field as typeof FACTORY_ID_FIELDS[number]);
      if (factoryNameField) {
        updateData[factoryNameField] = updatedProject[factoryNameField];
      }
    }
    
    await mockDb.update('projects', projectId, updateData);
    
    const newProjects = [
      ...projects.slice(0, projectIndex),
      updatedProject,
      ...projects.slice(projectIndex + 1)
    ];
    
    onUpdate?.(newProjects);
    return newProjects;
  } catch (error) {
    console.error('Failed to update project:', error);
    return projects;
  }
};

/**
 * Add a new project
 */
export const addNewProject = async (
  newProject: Omit<Project, 'id'>,
  projects: Project[],
  onUpdate?: (projects: Project[]) => void
): Promise<{ projects: Project[]; newProject?: Project }> => {
  try {
    // Validate project type
    if (!isProjectType(newProject.type)) {
      throw new Error(`Invalid project type: ${newProject.type}`);
    }

    // Create project in MockDB
    const response = await mockDb.create('projects', newProject);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create project');
    }

    const createdProject = response.data;
    
    // Add factory names
    if (createdProject.manufacturerId) {
      createdProject.manufacturerName = getFactoryNames(createdProject.manufacturerId);
    }
    if (createdProject.containerId) {
      createdProject.containerName = getFactoryNames(createdProject.containerId);
    }
    if (createdProject.packagingId) {
      createdProject.packagingName = getFactoryNames(createdProject.packagingId);
    }

    // Ensure customer display name
    if (createdProject.customer && createdProject.customer.company) {
      createdProject.customer.displayName = formatCompanyNameForDisplay(createdProject.customer.company);
    }

    const newProjects = [createdProject, ...projects];
    onUpdate?.(newProjects);
    
    return { projects: newProjects, newProject: createdProject };
  } catch (error) {
    console.error('Failed to add project:', error);
    return { projects };
  }
};

/**
 * Delete a project
 */
export const deleteProjectById = async (
  projectId: ProjectId,
  projects: Project[],
  onUpdate?: (projects: Project[]) => void
): Promise<Project[]> => {
  try {
    const response = await mockDb.delete('projects', projectId);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete project');
    }

    const newProjects = projects.filter(p => p.id !== projectId);
    onUpdate?.(newProjects);
    
    return newProjects;
  } catch (error) {
    console.error('Failed to delete project:', error);
    return projects;
  }
};

/**
 * Bulk update projects
 */
export const bulkUpdate = async (
  projectIds: ProjectId[],
  updates: Partial<Project>,
  projects: Project[],
  onUpdate?: (projects: Project[]) => void
): Promise<Project[]> => {
  const updatedProjects = projects.map(project => {
    if (projectIds.includes(project.id as ProjectId)) {
      return { ...project, ...updates };
    }
    return project;
  });

  onUpdate?.(updatedProjects);
  return updatedProjects;
};

// Helper functions
const getFactoryNameField = (factoryIdField: typeof FACTORY_ID_FIELDS[number]): keyof Project | null => {
  switch (factoryIdField) {
    case ProjectField.MANUFACTURER_ID:
      return ProjectField.MANUFACTURER_NAME;
    case ProjectField.CONTAINER_ID:
      return ProjectField.CONTAINER_NAME;
    case ProjectField.PACKAGING_ID:
      return ProjectField.PACKAGING_NAME;
    default:
      return null;
  }
};

const getFactoryNames = (factoryIds: string | string[]): string => {
  const ids = Array.isArray(factoryIds) ? factoryIds : [factoryIds];
  return ids
    .map(id => factories.find(f => f.id === id)?.name || '')
    .filter(Boolean)
    .join(', ');
};