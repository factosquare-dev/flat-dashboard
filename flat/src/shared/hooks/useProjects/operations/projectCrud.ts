/**
 * Project CRUD operations
 */

import type { Project } from '@/shared/types/project';
import type { ProjectId } from '@/shared/types/branded';
import type { FactoryAssignment } from '@/shared/types/schedule';
import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import { ProjectField, FactoryType, TaskStatus } from '@/shared/types/enums';
import { isProjectType } from '@/shared/utils/projectTypeUtils';
import { factories } from '@/core/database/factories';
import { formatCompanyNameForDisplay } from '@/shared/utils/companyUtils';
import { mockDataService } from '@/core/services/mockDataService';

const mockDb = MockDatabaseImpl.getInstance();

// Define factory ID fields for projects using enum
const FACTORY_ID_FIELDS = [
  ProjectField.MANUFACTURER_ID,
  ProjectField.CONTAINER_ID,
  ProjectField.PACKAGING_ID
] as const;

// Define date fields for projects using enum
const DATE_FIELDS = [
  ProjectField.START_DATE,
  ProjectField.END_DATE,
  ProjectField.CREATED_AT,
  ProjectField.UPDATED_AT
] as const;

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
  console.log(`[updateProjectField] Called with field: ${String(field)}, value:`, value);
  
  // Try to find project in passed array first
  let projectIndex = projects.findIndex(p => p.id === projectId);
  let project: Project | undefined;
  
  if (projectIndex === -1) {
    console.log(`[updateProjectField] Project ${projectId} not found in array, checking MockDB`);
    // Try to get directly from MockDatabase
    const db = MockDatabaseImpl.getInstance();
    const dbProject = db.getDatabase().projects.get(projectId);
    
    if (!dbProject) {
      console.log(`[updateProjectField] Project ${projectId} not found in MockDB either`);
      return projects;
    }
    
    project = dbProject;
    // Add to projects array for consistency
    projects = [...projects, dbProject];
    projectIndex = projects.length - 1;
  } else {
    project = projects[projectIndex];
  }

  let updatedProject = { ...project };

  // TASK-CENTRIC: Handle factory ID fields by assigning to tasks
  if ((FACTORY_ID_FIELDS as ReadonlyArray<string>).includes(field as string)) {
    console.log(`[updateProjectField] Field ${String(field)} is a factory ID field`);
    const factoryIdField = field as typeof FACTORY_ID_FIELDS[number];
    const factoryNameField = getFactoryNameField(factoryIdField);
    
    if (factoryNameField) {
      // Update project fields (for backward compatibility)
      updatedProject[factoryIdField] = value as any;
      updatedProject[factoryNameField] = value ? getFactoryNames(value as string | string[]) : undefined;
      
      // TASK-CENTRIC: Also assign factories to all project tasks
      const factoryIds = Array.isArray(value) ? value : value ? [value] : [];
      
      // Determine factory type from field
      let factoryType: FactoryType | undefined;
      if (factoryIdField === ProjectField.MANUFACTURER_ID) {
        factoryType = FactoryType.MANUFACTURING;
      } else if (factoryIdField === ProjectField.CONTAINER_ID) {
        factoryType = FactoryType.CONTAINER;
      } else if (factoryIdField === ProjectField.PACKAGING_ID) {
        factoryType = FactoryType.PACKAGING;
      }
      
      const projectTasks = mockDataService.getTasksByProjectId(projectId);
      
      console.log(`[ProjectList] Adding ${factoryType} factory to project ${projectId}:`, factoryIds);
      console.log(`[ProjectList] Found ${projectTasks.length} tasks to update`);
      
      // First, clear existing factories of this type from tasks
      projectTasks.forEach(task => {
        let shouldClear = false;
        
        if (factoryType === FactoryType.MANUFACTURING) {
          shouldClear = task.title?.includes('제품') || task.title?.includes('생산') || 
                       task.title?.includes('시제품') || task.title?.includes('품질');
        } else if (factoryType === FactoryType.CONTAINER) {
          shouldClear = task.title?.includes('용기') || task.title?.includes('금형') || 
                       task.title?.includes('사출');
        } else if (factoryType === FactoryType.PACKAGING) {
          shouldClear = task.title?.includes('포장') || task.title?.includes('인쇄') || 
                       task.title?.includes('색상') || task.title?.includes('후가공');
        }
        
        if (shouldClear && task.factoryAssignments) {
          // Remove factories of this type
          task.factoryAssignments = task.factoryAssignments.filter(
            fa => fa.factoryType !== factoryType
          );
          mockDataService.updateTask(task.id, { factoryAssignments: task.factoryAssignments });
        }
      });
      
      // Assign each factory to relevant tasks based on task type
      factoryIds.forEach((factoryId, index) => {
        const factory = factories.find(f => f.id === factoryId);
        console.log(`[ProjectList] Processing factory ${index + 1}/${factoryIds.length}: ${factoryId} (${factory?.name})`);
        
        if (factory && factoryType) {
          let assignedCount = 0;
          projectTasks.forEach(task => {
            // Check if task matches the factory type
            let shouldAssign = false;
            
            if (factoryType === FactoryType.MANUFACTURING) {
              // Manufacturing tasks
              shouldAssign = task.title?.includes('제품') || task.title?.includes('생산') || 
                           task.title?.includes('시제품') || task.title?.includes('품질');
            } else if (factoryType === FactoryType.CONTAINER) {
              // Container tasks
              shouldAssign = task.title?.includes('용기') || task.title?.includes('금형') || 
                           task.title?.includes('사출');
            } else if (factoryType === FactoryType.PACKAGING) {
              // Packaging tasks
              shouldAssign = task.title?.includes('포장') || task.title?.includes('인쇄') || 
                           task.title?.includes('색상') || task.title?.includes('후가공');
            }
            
            if (shouldAssign) {
              const newAssignment: FactoryAssignment = {
                factoryId: factory.id,
                factoryName: factory.name,
                factoryType,
                status: task.status || TaskStatus.PENDING,
                progress: task.progress,
                startDate: task.startDate,
                endDate: task.endDate
              };
              
              const success = mockDataService.assignFactoryToTask(task.id, newAssignment);
              if (success) {
                assignedCount++;
              }
            }
          });
          console.log(`[ProjectList] Factory ${factory.name} assigned to ${assignedCount} tasks`);
        }
      });
      
      // Trigger a custom event to notify TableView of changes
      window.dispatchEvent(new CustomEvent('factory-assigned-to-tasks', { 
        detail: { projectId, factoryType } 
      }));
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
      return ProjectField.MANUFACTURER_NAME as keyof Project;
    case ProjectField.CONTAINER_ID:
      return ProjectField.CONTAINER_NAME as keyof Project;
    case ProjectField.PACKAGING_ID:
      return ProjectField.PACKAGING_NAME as keyof Project;
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