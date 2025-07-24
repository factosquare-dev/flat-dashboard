import type { Project } from '../types/project';
import { MockDatabaseImpl } from '../mocks/database/MockDatabase';
import { staticHierarchicalProjects } from './hierarchicalProjectsStatic';

// Get projects from mock database instead of hardcoded data
const getHierarchicalProjects = (): Project[] => {
  try {
    const db = MockDatabaseImpl.getInstance();
    
    // Check if database is properly initialized
    if (!db || typeof db.getDatabase !== 'function') {
      console.warn('[hierarchicalProjects] Mock database not initialized, using static data');
      return staticHierarchicalProjects;
    }
    
    const database = db.getDatabase();
    if (!database || !database.projects || database.projects.size === 0) {
      console.warn('[hierarchicalProjects] Database projects not available, using static data');
      return staticHierarchicalProjects;
    }
    
    const projects = Array.from(database.projects.values());
    const customers = Array.from(database.customers.values());
    const users = Array.from(database.users.values());
    const factories = Array.from(database.factories.values());
    
    console.log('[hierarchicalProjects] Loaded data:', {
      projectsCount: projects.length,
      customersCount: customers.length,
      usersCount: users.length,
      factoriesCount: factories.length,
      firstProject: projects[0],
      customers: customers.map(c => ({id: c.id, name: c.name}))
    });
  
  // Build hierarchical structure
  const masterProjects = projects.filter(p => p.type === 'MASTER');
  
  return masterProjects.map(master => {
    const subProjects = projects.filter(p => p.parentId === master.id);
    
    // Get customer from database
    const masterCustomer = customers.find(c => c.id === master.customerId);
    const customerName = masterCustomer?.name || 'Unknown Customer';
    
    // Get factory names from database
    const manufacturerFactory = factories.find(f => f.id === master.manufacturerId);
    const containerFactory = factories.find(f => f.id === master.containerId);
    const packagingFactory = factories.find(f => f.id === master.packagingId);
    
    // Map to legacy format for backward compatibility
    const mappedMaster = {
      ...master,
      type: 'master' as any,
      level: 0,
      isExpanded: true,
      client: customerName, // Use customer name from database
      manager: users.find(u => u.id === master.createdBy)?.name || 'Unknown',
      productType: master.product.name,
      serviceType: 'OEM' as any, // Default service type
      currentStage: getStagesFromProgress(master.progress),
      status: mapProjectStatus(master.status),
      startDate: master.startDate.toISOString().split('T')[0],
      endDate: master.endDate.toISOString().split('T')[0],
      manufacturer: manufacturerFactory?.name || master.manufacturerId,
      container: containerFactory?.name || master.containerId,
      packaging: packagingFactory?.name || master.packagingId,
      priority: master.priority,
      depositPaid: master.depositStatus === 'received',
      children: subProjects.map(sub => {
        // SUB projects should inherit MASTER's customer
        const subCustomer = customers.find(c => c.id === sub.customerId);
        const subCustomerName = subCustomer?.name || customerName; // Fallback to master's customer
        
        // Get factory names for sub project
        const subManufacturerFactory = factories.find(f => f.id === sub.manufacturerId);
        const subContainerFactory = factories.find(f => f.id === sub.containerId);
        const subPackagingFactory = factories.find(f => f.id === sub.packagingId);
        
        return {
          ...sub,
          type: 'sub' as any,
          level: 1,
          parentId: master.id,
          client: customerName, // SUB project inherits MASTER's customer
          manager: users.find(u => u.id === sub.createdBy)?.name || 'Unknown',
          productType: sub.product.name,
          serviceType: 'OEM' as any,
          currentStage: getStagesFromProgress(sub.progress),
          status: mapProjectStatus(sub.status),
          startDate: sub.startDate.toISOString().split('T')[0],
          endDate: sub.endDate.toISOString().split('T')[0],
          manufacturer: subManufacturerFactory?.name || sub.manufacturerId,
          container: subContainerFactory?.name || sub.containerId,
          packaging: subPackagingFactory?.name || sub.packagingId,
          priority: sub.priority,
          depositPaid: sub.depositStatus === 'received',
          children: [] // Tasks would go here if needed
        };
      })
    };
    
    return mappedMaster;
  });
  } catch (error) {
    console.error('[hierarchicalProjects] Error getting hierarchical projects:', error);
    return staticHierarchicalProjects;
  }
};

// Helper function to map project status
const mapProjectStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PLANNING': '시작전',
    'IN_PROGRESS': '진행중',
    'COMPLETED': '완료',
    'CANCELLED': '중단',
    'ON_HOLD': '중단'
  };
  return statusMap[status] || status;
};

// Helper function to get stages from progress
const getStagesFromProgress = (progress: number): string[] => {
  if (progress === 0) return ['시작전'];
  if (progress < 30) return ['설계'];
  if (progress < 60) return ['설계', '제조'];
  if (progress < 90) return ['설계', '제조', '포장'];
  if (progress === 100) return ['완료'];
  return ['진행중'];
};

// Lazy load hierarchical projects to avoid initialization issues
let _hierarchicalProjects: Project[] | null = null;

export const getHierarchicalProjectsData = (): Project[] => {
  // Always get fresh data, don't cache
  _hierarchicalProjects = getHierarchicalProjects();
  return _hierarchicalProjects;
};

// For backward compatibility
export const hierarchicalProjects: Project[] = [];

// Flatten hierarchical projects for display
export const flattenProjects = (projects: Project[]): Project[] => {
  const flattened: Project[] = [];
  
  const flatten = (projectList: Project[], level: number = 0) => {
    projectList.forEach(project => {
      flattened.push({ ...project, level });
      if (project.children && project.isExpanded) {
        flatten(project.children, level + 1);
      }
    });
  };
  
  flatten(projects);
  return flattened;
};

// Toggle project expansion
export const toggleProject = (projects: Project[], projectId: string): Project[] => {
  return projects.map(project => {
    if (project.id === projectId) {
      return { ...project, isExpanded: !project.isExpanded };
    }
    if (project.children) {
      return { ...project, children: toggleProject(project.children, projectId) };
    }
    return project;
  });
};