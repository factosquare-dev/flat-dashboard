import { Project } from '@/types/project';
import { FactoryId } from '@/types/branded';
import { factories } from '../../../../data/factories';

// Helper function to get factory names
export function getFactoryName(factoryId: string | FactoryId | null): string | null {
  if (!factoryId) return null;
  
  // Get from static factories data
  const factory = factories.find(f => f.id === factoryId);
  return factory ? factory.name : null;
}

// Helper function to convert factory IDs to names
export function getFactoryNames(factoryIds: string | FactoryId | (string | FactoryId)[] | null): string | string[] | null {
  if (!factoryIds) return null;
  
  if (Array.isArray(factoryIds)) {
    const names = factoryIds.map(id => getFactoryName(id)).filter(name => name !== null) as string[];
    return names.length > 0 ? names : null;
  }
  
  return getFactoryName(factoryIds);
}

// Helper function to add factory names to project
export function enrichProjectWithFactoryNames(project: Omit<Project, 'manufacturer' | 'container' | 'packaging'>): Project {
  return {
    ...project,
    manufacturer: getFactoryNames(project.manufacturerId),
    container: getFactoryNames(project.containerId),
    packaging: getFactoryNames(project.packagingId),
  };
}