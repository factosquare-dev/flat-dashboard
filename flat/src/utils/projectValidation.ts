import { Project, ProjectType } from '../types/project';

/**
 * Fields that must be synchronized between MASTER and SUB projects
 */
export const MASTER_SUB_SYNC_FIELDS = [
  'customerId',
  'manufacturerId', 
  'containerId',
  'packagingId',
  'priority'
] as const;

export type SyncField = typeof MASTER_SUB_SYNC_FIELDS[number];

/**
 * Validate that SUB project has same values as MASTER for sync fields
 */
export function validateSubProjectSync(
  subProject: Partial<Project>, 
  masterProject: Project
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check each sync field
  MASTER_SUB_SYNC_FIELDS.forEach(field => {
    if (subProject[field] !== undefined && subProject[field] !== masterProject[field]) {
      errors.push(`${field} must match MASTER project value (${masterProject[field]})`);
    }
  });

  // Additional validation: SUB dates must be within MASTER dates
  if (subProject.startDate && masterProject.startDate) {
    const subStart = new Date(subProject.startDate);
    const masterStart = new Date(masterProject.startDate);
    if (subStart < masterStart) {
      errors.push('SUB project cannot start before MASTER project');
    }
  }

  if (subProject.endDate && masterProject.endDate) {
    const subEnd = new Date(subProject.endDate);
    const masterEnd = new Date(masterProject.endDate);
    if (subEnd > masterEnd) {
      errors.push('SUB project cannot end after MASTER project');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sync SUB project fields with MASTER project
 */
export function syncSubWithMaster(
  subProject: Partial<Project>,
  masterProject: Project
): Partial<Project> {
  const synced = { ...subProject };

  // Sync all required fields
  MASTER_SUB_SYNC_FIELDS.forEach(field => {
    synced[field] = masterProject[field];
  });

  // Ensure dates are within bounds
  if (synced.startDate) {
    const subStart = new Date(synced.startDate);
    const masterStart = new Date(masterProject.startDate);
    if (subStart < masterStart) {
      synced.startDate = masterProject.startDate;
    }
  }

  if (synced.endDate) {
    const subEnd = new Date(synced.endDate);
    const masterEnd = new Date(masterProject.endDate);
    if (subEnd > masterEnd) {
      synced.endDate = masterProject.endDate;
    }
  }

  return synced;
}

/**
 * Get all SUB projects that need to be updated when MASTER changes
 */
export function getAffectedSubProjects(
  masterId: string,
  allProjects: Project[]
): Project[] {
  return allProjects.filter(
    project => project.type === ProjectType.SUB && project.parentId === masterId
  );
}

/**
 * Update all SUB projects when MASTER project changes sync fields
 */
export function updateSubProjectsFromMaster(
  masterProject: Project,
  changedFields: Partial<Project>,
  allProjects: Project[]
): Array<{ project: Project; updates: Partial<Project> }> {
  const updates: Array<{ project: Project; updates: Partial<Project> }> = [];
  
  // Check if any sync fields changed
  const syncFieldsChanged = MASTER_SUB_SYNC_FIELDS.some(
    field => changedFields[field] !== undefined
  );

  if (!syncFieldsChanged && !changedFields.startDate && !changedFields.endDate) {
    return updates; // No sync needed
  }

  // Get all SUB projects of this MASTER
  const subProjects = getAffectedSubProjects(masterProject.id, allProjects);

  subProjects.forEach(sub => {
    const projectUpdates: Partial<Project> = {};

    // Sync changed fields
    MASTER_SUB_SYNC_FIELDS.forEach(field => {
      if (changedFields[field] !== undefined) {
        projectUpdates[field] = changedFields[field];
      }
    });

    // Handle date changes
    if (changedFields.startDate || changedFields.endDate) {
      const newMasterStart = changedFields.startDate || masterProject.startDate;
      const newMasterEnd = changedFields.endDate || masterProject.endDate;

      // Adjust SUB dates if they're out of bounds
      if (sub.startDate < newMasterStart) {
        projectUpdates.startDate = newMasterStart;
      }
      if (sub.endDate > newMasterEnd) {
        projectUpdates.endDate = newMasterEnd;
      }
    }

    if (Object.keys(projectUpdates).length > 0) {
      updates.push({ project: sub, updates: projectUpdates });
    }
  });

  return updates;
}