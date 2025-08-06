/**
 * Project loading operations
 */

import type { Project } from '@/types/project';
import { ProjectStatus, Priority, ServiceType, ProductType, ProjectType } from '@/types/enums';
import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';
import { factories } from '@/data/factories';
import { formatCompanyNameForDisplay } from '@/utils/companyUtils';
import { SIMULATION_CONSTANTS } from '../helpers/projectHelpers';

/**
 * Load projects from the database
 */
export const loadProjectsFromDb = async (signal: AbortSignal, page: number = 1): Promise<Project[]> => {
  const mockDb = MockDatabaseImpl.getInstance();
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, SIMULATION_CONSTANTS.API_DELAY));
  
  if (signal.aborted) return [];
  
  // Load projects from MockDB
  const dbResponse = await mockDb.getAll('projects');
  const dbProjects = dbResponse.success ? dbResponse.data : [];
  
  console.log('[ProjectLoader] Loaded projects from DB:', dbProjects.length);
  
  // Implement pagination
  const itemsPerPage = 50;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = dbProjects.slice(startIndex, endIndex);
  
  console.log(`[ProjectLoader] Page ${page}: Returning ${paginatedProjects.length} projects (${startIndex}-${endIndex} of ${dbProjects.length})`);
  
  // Enrich projects with factory names and ensure enum types
  const enrichedProjects = paginatedProjects.map(project => {
    const enrichedProject = { ...project };
    
    // Convert string values to proper enum types
    if (typeof enrichedProject.status === 'string') {
      enrichedProject.status = enrichedProject.status as ProjectStatus;
    }
    if (typeof enrichedProject.priority === 'string') {
      enrichedProject.priority = enrichedProject.priority as Priority;
    }
    if (typeof enrichedProject.serviceType === 'string') {
      enrichedProject.serviceType = enrichedProject.serviceType as ServiceType;
    }
    if (typeof enrichedProject.productType === 'string') {
      enrichedProject.productType = enrichedProject.productType as ProductType;
    }
    if (typeof enrichedProject.type === 'string') {
      enrichedProject.type = enrichedProject.type as ProjectType;
    }
    
    // Add factory names
    enrichedProject.manufacturerName = enrichedProject.manufacturerId 
      ? getFactoryNames(enrichedProject.manufacturerId) 
      : undefined;
    enrichedProject.containerName = enrichedProject.containerId 
      ? getFactoryNames(enrichedProject.containerId) 
      : undefined;
    enrichedProject.packagingName = enrichedProject.packagingId 
      ? getFactoryNames(enrichedProject.packagingId) 
      : undefined;
    
    // Ensure customer display names
    if (enrichedProject.customer && enrichedProject.customer.company) {
      enrichedProject.customer.displayName = formatCompanyNameForDisplay(enrichedProject.customer.company);
    }
    
    return enrichedProject as Project;
  });
  
  // Sort by creation date (newest first)
  return enrichedProjects.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Get factory names from factory IDs
 */
const getFactoryNames = (factoryIds: string | string[]): string => {
  const ids = Array.isArray(factoryIds) ? factoryIds : [factoryIds];
  return ids
    .map(id => factories.find(f => f.id === id)?.name || '')
    .filter(Boolean)
    .join(', ');
};