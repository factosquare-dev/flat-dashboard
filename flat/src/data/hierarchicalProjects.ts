import type { Project } from '../types/project';
import type { ProjectId } from '../types/branded';
import { MockDatabaseImpl } from '../mocks/database/MockDatabase';
import { calculateProgressFromTasks } from '../utils/progressCalculator';
import type { Task } from '../types/schedule';
import { debugHierarchyIssue } from '../utils/debugHierarchy';
import { TaskStatus, ProjectType, ServiceType, Priority } from '../types/enums';

// Get projects from mock database instead of hardcoded data
const getHierarchicalProjects = (): Project[] => {
  try {
    const db = MockDatabaseImpl.getInstance();
    
    // Check if database is properly initialized
    if (!db || typeof db.getDatabase !== 'function') {
      return [];
    }
    
    const database = db.getDatabase();
    if (!database || !database.projects || database.projects.size === 0) {
      return [];
    }
    
    const projects = Array.from(database.projects.values());
    const customers = Array.from(database.customers.values());
    const users = Array.from(database.users.values());
    const factories = Array.from(database.factories.values());
    
    
    // Debug hierarchy issues
    debugHierarchyIssue();
  
  // Build hierarchical structure
  // MASTER projects should never have a parentId
  const masterProjects = projects.filter(p => p.type === 'MASTER' && !p.parentId);
  
  // Independent SUB projects (no parentId)
  const independentSubProjects = projects.filter(p => p.type === 'SUB' && !p.parentId);
  
  // First, add all MASTER projects with their children
  const hierarchicalProjects = masterProjects.map(master => {
    // Only get SUB projects as children
    const subProjects = projects.filter(p => p.type === 'SUB' && p.parentId === master.id);
    
    // Get customer from database
    const masterCustomer = customers.find(c => c.id === master.customerId);
    const customerName = masterCustomer?.name || 'Unknown Customer';
    
    // Get factory names from database
    const manufacturerFactory = factories.find(f => f.id === master.manufacturerId);
    const containerFactory = factories.find(f => f.id === master.containerId);
    const packagingFactory = factories.find(f => f.id === master.packagingId);
    
    // Map to UI display format
    const mappedMaster = {
      ...master,
      level: 0,
      isExpanded: master.isExpanded !== undefined ? master.isExpanded : true, // Preserve existing state or default to true
      client: customerName, // Use customer name from database
      manager: users.find(u => u.id === master.managerId)?.name || 'Unknown',
      currentStage: [], // MASTER projects don't show individual task stages
      progress: getStagesFromTasks(master.scheduleId).progress, // Only show overall progress
      manufacturer: manufacturerFactory?.name || master.manufacturerId,
      container: containerFactory?.name || master.containerId,
      packaging: packagingFactory?.name || master.packagingId,
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
          // UI display fields
          name: master.name, // SUB project inherits MASTER's project name
          level: 1,
          parentId: master.id,
          client: customerName, // SUB project inherits MASTER's customer
          manager: users.find(u => u.id === sub.managerId)?.name || 'Unknown',
          currentStage: getStagesFromTasks(sub.scheduleId).stages,
          progress: getStagesFromTasks(sub.scheduleId).progress,
          manufacturer: subManufacturerFactory?.name || sub.manufacturerId,
          container: subContainerFactory?.name || sub.containerId,
          packaging: subPackagingFactory?.name || sub.packagingId,
          children: getTasksForProject(sub.scheduleId), // Get tasks as children for SUB projects
          // Keep original enum values
          serviceType: sub.serviceType,
          productType: sub.productType,
          priority: sub.priority,
          status: sub.status
        };
      })
    };
    
    return mappedMaster;
  });
  
  // Then, add independent SUB projects as top-level items
  const independentSubsAsMaster = independentSubProjects.map(sub => {
    // Get customer from database
    const subCustomer = customers.find(c => c.id === sub.customerId);
    const customerName = subCustomer?.name || 'Unknown Customer';
    
    // Get factory names for sub project
    const manufacturerFactory = factories.find(f => f.id === sub.manufacturerId);
    const containerFactory = factories.find(f => f.id === sub.containerId);
    const packagingFactory = factories.find(f => f.id === sub.packagingId);
    
    return {
      ...sub,
      // UI display fields
      level: 0, // Top level
      isExpanded: false, // SUB projects don't have children
      client: customerName,
      manager: users.find(u => u.id === sub.managerId)?.name || 'Unknown',
      currentStage: getStagesFromTasks(sub.scheduleId).stages,
      progress: getStagesFromTasks(sub.scheduleId).progress,
      manufacturer: manufacturerFactory?.name || sub.manufacturerId,
      container: containerFactory?.name || sub.containerId,
      packaging: packagingFactory?.name || sub.packagingId,
      children: getTasksForProject(sub.scheduleId), // Get tasks for independent SUB projects too
      // Keep original enum values
      serviceType: sub.serviceType,
      productType: sub.productType,
      priority: sub.priority,
      status: sub.status
    };
  });
  
  // Return combined list: MASTER projects with children + independent SUB projects
  return [...hierarchicalProjects, ...independentSubsAsMaster];
  } catch (error) {
    return [];
  }
};

// Helper function to get tasks for a project
const getTasksForProject = (scheduleId: ProjectId): Project[] => {
  if (!scheduleId) {
    return [];
  }
  
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    
    // Get tasks for this schedule
    const tasks = Array.from(database.tasks.values())
      .filter(task => task.scheduleId === scheduleId);
    
    // Convert tasks to Project format for display
    return tasks.map(task => ({
      id: task.id,
      name: task.name,
      projectNumber: '', // Tasks don't have project numbers
      type: ProjectType.TASK,
      level: 2, // Tasks are at level 2 (under SUB projects)
      isExpanded: false,
      client: '', // Inherit from parent
      manager: '', // Tasks don't have manager
      productType: '',
      serviceType: ServiceType.OEM,
      currentStage: [task.status],
      progress: task.progress || 0,
      status: task.status as any,
      startDate: task.startDate,
      endDate: task.endDate,
      manufacturer: '',
      container: '',
      packaging: '',
      priority: Priority.LOW,
      depositPaid: false,
      children: [],
      // Task-specific fields
      taskType: task.type,
      quantity: task.quantity,
      description: task.description,
      factory: task.factory,
      participants: task.participants
    } as Project));
  } catch (error) {
    return [];
  }
};

// Remove all mapping functions - keep enum values as-is

// Helper function to get stages from tasks
const getStagesFromTasks = (scheduleId: ProjectId | undefined): { stages: string[], progress: number } => {
  if (!scheduleId) {
    return { stages: [], progress: 0 };
  }
  
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    
    // Get schedule from database
    const schedule = database.schedules.get(scheduleId);
    if (!schedule) {
      // Schedule not found
      return { stages: [], progress: 0 };
    }
    
    // Get tasks for this schedule
    const tasks = Array.from(database.tasks.values()).filter(task => task.scheduleId === scheduleId);
    
    if (tasks.length === 0) {
      // No tasks found
      return { stages: [], progress: 0 };
    }
    
    // Found tasks
    
    // Check incomplete tasks if needed
    
    // Calculate progress and current stages from actual tasks
    const progressInfo = calculateProgressFromTasks(tasks);
    
    // Progress calculated
    
    // If no current stages (no tasks today), return empty array
    // Let the UI decide how to display when there are no tasks today
    if (progressInfo.currentStages.length === 0) {
      // No current stages today
      return { stages: [], progress: progressInfo.progress };
    }
    
    
    return { 
      stages: progressInfo.currentStages, 
      progress: progressInfo.progress 
    };
  } catch (error) {
    // Error calculating stages
    return { stages: [], progress: 0 };
  }
};

// Lazy load hierarchical projects to avoid initialization issues
let _hierarchicalProjects: Project[] | null = null;

export const getHierarchicalProjectsData = (): Project[] => {
  // Always get fresh data, don't cache
  console.log('[getHierarchicalProjectsData] Getting fresh data - this will reset isExpanded to true!');
  _hierarchicalProjects = getHierarchicalProjects();
  return _hierarchicalProjects;
};


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