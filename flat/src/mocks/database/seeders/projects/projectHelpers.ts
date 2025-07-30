import { Project } from '@/types/project';
import { factories } from '../../../../data/factories';

// Helper function to get factory names
export function getFactoryName(factoryId: string | null): string | null {
  if (!factoryId) return null;
  const factory = factories.find(f => f.id === factoryId);
  return factory ? factory.name : null;
}

// Helper function to add factory names to project
export function enrichProjectWithFactoryNames(project: Omit<Project, 'manufacturer' | 'container' | 'packaging'>): Project {
  return {
    ...project,
    manufacturer: getFactoryName(project.manufacturerId),
    container: getFactoryName(project.containerId),
    packaging: getFactoryName(project.packagingId),
  };
}