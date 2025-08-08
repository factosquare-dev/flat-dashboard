import type { Project } from '../types/project';
import type { ProjectId } from '../types/branded';
import { MockDatabaseImpl } from '../mocks/database/MockDatabase';
import { calculateProgressFromTasks } from '../utils/progressCalculator';
import type { Task } from '../types/schedule';
import { debugHierarchyIssue } from '../utils/debugHierarchy';
import { TaskStatus, ProjectType, ServiceType, Priority, TableColumnId } from '../types/enums';

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
  const masterProjects = projects.filter(p => p.type === ProjectType.MASTER && !p.parentId);
  
  // Independent SUB projects (no parentId)
  const independentSubProjects = projects.filter(p => p.type === ProjectType.SUB && !p.parentId);
  
  // First, add all MASTER projects with their children
  const hierarchicalProjects = masterProjects.map(master => {
    // Only get SUB projects as children
    const subProjects = projects.filter(p => p.type === ProjectType.SUB && p.parentId === master.id);
    
    // Get customer from database
    const masterCustomer = customers.find(c => c.id === master.customerId);
    const customerName = masterCustomer?.name || 'Unknown Customer';
    
    // Aggregate product types from SUB projects
    const productTypes = [...new Set(subProjects.map(sub => sub.productType).filter(Boolean))];
    const aggregatedProductType = productTypes.length === 1 
      ? productTypes[0] 
      : (productTypes.length > 1 ? productTypes.join(', ') : master.productType);
    
    // Aggregate factory information from SUB projects
    const manufacturerIds = [...new Set(subProjects.map(sub => sub.manufacturerId).filter(Boolean))];
    const containerIds = [...new Set(subProjects.map(sub => sub.containerId).filter(Boolean))];
    const packagingIds = [...new Set(subProjects.map(sub => sub.packagingId).filter(Boolean))];
    
    // Get unique factory names from SUB projects
    const manufacturerNames = manufacturerIds.map(id => factories.find(f => f.id === id)?.name).filter(Boolean);
    const containerNames = containerIds.map(id => factories.find(f => f.id === id)?.name).filter(Boolean);
    const packagingNames = packagingIds.map(id => factories.find(f => f.id === id)?.name).filter(Boolean);
    
    // Calculate aggregated values from SUB projects
    const aggregatedSales = subProjects.reduce((sum, sub) => {
      const sales = typeof sub.sales === 'string' ? parseFloat(sub.sales) || 0 : sub.sales || 0;
      return sum + sales;
    }, 0);
    
    const aggregatedPurchase = subProjects.reduce((sum, sub) => {
      const purchase = typeof sub.purchase === 'string' ? parseFloat(sub.purchase) || 0 : sub.purchase || 0;
      return sum + purchase;
    }, 0);
    
    // Aggregate depositPaid from SUB projects (any SUB has deposit = MASTER has deposit)
    const aggregatedDepositPaid = subProjects.some(sub => sub.depositPaid === true);

    // Calculate date range from SUB projects
    const subStartDates = subProjects.map(sub => sub.startDate).filter(Boolean);
    const subEndDates = subProjects.map(sub => sub.endDate).filter(Boolean);
    const earliestStartDate = subStartDates.length > 0 ? subStartDates.sort()[0] : master.startDate;
    const latestEndDate = subEndDates.length > 0 ? subEndDates.sort().reverse()[0] : master.endDate;

    // Collect all schedule IDs from SUB projects for aggregated view
    const allScheduleIds = [master.scheduleId, ...subProjects.map(sub => sub.scheduleId)].filter(Boolean);
    
    // Calculate overall progress from all SUB projects
    const overallProgress = subProjects.length > 0 
      ? Math.round(subProjects.reduce((sum, sub) => {
          const subProgress = getStagesFromTasks(sub.scheduleId).progress;
          return sum + subProgress;
        }, 0) / subProjects.length)
      : getStagesFromTasks(master.scheduleId).progress;

    // Map to UI display format
    const mappedMaster = {
      ...master,
      level: 0,
      isExpanded: master.isExpanded !== undefined ? master.isExpanded : true, // Preserve existing state or default to true
      client: customerName, // Use customer name from database
      manager: users.find(u => u.id === master.managerId)?.name || 'Unknown',
      currentStage: [], // MASTER projects don't show individual task stages
      progress: overallProgress, // Show aggregated progress from all SUB projects
      productType: aggregatedProductType, // Aggregated product type from SUB projects
      allScheduleIds: allScheduleIds, // For Schedule/TableView aggregation
      manufacturer: manufacturerNames.length > 0 ? manufacturerNames : '',
      container: containerNames.length > 0 ? containerNames : '',
      packaging: packagingNames.length > 0 ? packagingNames : '',
      manufacturerId: manufacturerIds,
      containerId: containerIds,
      packagingId: packagingIds,
      // Aggregated values from SUB projects
      sales: aggregatedSales,
      purchase: aggregatedPurchase,
      depositPaid: aggregatedDepositPaid,
      startDate: earliestStartDate,
      endDate: latestEndDate,
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
          // Inherit from MASTER (Master → Sub)
          name: master.name, // SUB project inherits MASTER's project name
          serviceType: master.serviceType, // Inherit service type
          client: customerName, // SUB project inherits MASTER's customer
          status: master.status, // Inherit status
          // UI display fields
          level: 1,
          parentId: master.id,
          manager: users.find(u => u.id === sub.managerId)?.name || 'Unknown',
          currentStage: getStagesFromTasks(sub.scheduleId).stages,
          progress: getStagesFromTasks(sub.scheduleId).progress,
          manufacturer: subManufacturerFactory?.name || sub.manufacturerId,
          container: subContainerFactory?.name || sub.containerId,
          packaging: subPackagingFactory?.name || sub.packagingId,
          children: getTasksForProject(sub.scheduleId), // Get tasks as children for SUB projects
          // Keep SUB-specific values (not inherited)
          productType: sub.productType,
          priority: sub.priority,
          sales: sub.sales,
          purchase: sub.purchase,
          startDate: sub.startDate,
          endDate: sub.endDate
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

// Helper function to get stages from tasks for SUB projects
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
    
    // Calculate progress and current stages from actual tasks
    const progressInfo = calculateProgressFromTasks(tasks);
    
    return { 
      stages: progressInfo.currentStages, // Return only today's task names
      progress: progressInfo.progress 
    };
  } catch (error) {
    // Error calculating stages
    return { stages: [], progress: 0 };
  }
};

// Helper function to get aggregated stages from multiple SUB projects
const getAggregatedStagesFromSubProjects = (scheduleIds: ProjectId[]): { stages: string[], progress: number } => {
  if (!scheduleIds || scheduleIds.length === 0) {
    return { stages: [], progress: 0 };
  }
  
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    
    // Get all tasks from all SUB project schedules
    const allTasks: Task[] = [];
    scheduleIds.forEach(scheduleId => {
      const tasks = Array.from(database.tasks.values()).filter(task => task.scheduleId === scheduleId);
      allTasks.push(...tasks);
    });
    
    if (allTasks.length === 0) {
      return { stages: [], progress: 0 };
    }
    
    // Calculate aggregated progress
    const progressInfo = calculateProgressFromTasks(allTasks);
    
    return {
      stages: progressInfo.currentStages,
      progress: progressInfo.progress
    };
  } catch (error) {
    return { stages: [], progress: 0 };
  }
};

// Lazy load hierarchical projects to avoid initialization issues
let _hierarchicalProjects: Project[] | null = null;

export const getHierarchicalProjectsData = (filteredProjects?: Project[]): Project[] => {
  // If filtered projects are provided and not empty, use them
  if (filteredProjects && filteredProjects.length > 0) {
    console.log('[getHierarchicalProjectsData] Using filtered projects:', filteredProjects.length);
    // Build hierarchy from filtered projects
    return buildHierarchyFromFiltered(filteredProjects);
  }
  
  // If filteredProjects is empty array, return empty (respecting the filter)
  if (filteredProjects && filteredProjects.length === 0) {
    console.log('[getHierarchicalProjectsData] Filtered projects is empty, returning empty array');
    return [];
  }
  
  // Otherwise get all projects from DB (when filteredProjects is undefined)
  console.log('[getHierarchicalProjectsData] No filter provided, getting all from DB');
  _hierarchicalProjects = getHierarchicalProjects();
  return _hierarchicalProjects;
};

// Build hierarchical structure from filtered projects
const buildHierarchyFromFiltered = (projects: Project[]): Project[] => {
  if (!projects || projects.length === 0) {
    console.log('[buildHierarchyFromFiltered] No projects to process');
    return [];
  }

  const db = MockDatabaseImpl.getInstance();
  const database = db.getDatabase();
  const users = Array.from(database.users.values());
  const factories = Array.from(database.factories.values());
  const customers = Array.from(database.customers.values());
  
  // Debug logging
  console.log('[buildHierarchyFromFiltered] Input projects:', projects.length);
  console.log('[buildHierarchyFromFiltered] Project types:', projects.map(p => ({ id: p.id, type: p.type, name: p.name })));
  
  // Separate master and sub projects
  const masterProjects = projects.filter(p => p.type === ProjectType.MASTER || p.type === 'MASTER');
  const subProjects = projects.filter(p => p.type === ProjectType.SUB || p.type === 'SUB');
  
  console.log('[buildHierarchyFromFiltered] Masters:', masterProjects.length, 'Subs:', subProjects.length);
  
  // Build hierarchy
  const hierarchical: Project[] = [];
  
  // Add master projects with their filtered children
  masterProjects.forEach(master => {
    // Only use SUB projects that passed the filter
    const filteredSubProjects = subProjects.filter(sub => sub.parentId === master.id);
    
    const customer = customers.find(c => c.id === master.customerId);
    const customerName = customer?.name || master.client || 'Unknown Customer';
    
    // Aggregate values from SUB projects
    const aggregatedSales = filteredSubProjects.reduce((sum, sub) => {
      const sales = typeof sub.sales === 'string' ? parseFloat(sub.sales) || 0 : sub.sales || 0;
      return sum + sales;
    }, 0);
    
    const aggregatedPurchase = filteredSubProjects.reduce((sum, sub) => {
      const purchase = typeof sub.purchase === 'string' ? parseFloat(sub.purchase) || 0 : sub.purchase || 0;
      return sum + purchase;
    }, 0);
    
    const aggregatedDepositPaid = filteredSubProjects.some(sub => sub.depositPaid === true);
    
    hierarchical.push({
      ...master,
      level: 0,
      client: customerName,
      isExpanded: master.isExpanded !== undefined ? master.isExpanded : true,
      // Aggregated values
      sales: aggregatedSales,
      purchase: aggregatedPurchase,
      depositPaid: aggregatedDepositPaid,
      children: filteredSubProjects.map(child => ({
        ...child,
        name: master.name, // SUB inherits MASTER's project name
        level: 1,
        client: customerName,
        serviceType: master.serviceType, // Inherit service type
        status: master.status, // Inherit status
        isExpanded: false
      }))
    });
  });
  
  // Add independent SUB projects (those without parentId)
  const independentSubs = subProjects.filter(sub => !sub.parentId);
  independentSubs.forEach(sub => {
    const customer = customers.find(c => c.id === sub.customerId);
    const customerName = customer?.name || sub.client || 'Unknown Customer';
    
    hierarchical.push({
      ...sub,
      level: 0,
      client: customerName,
      isExpanded: false
    });
  });
  
  console.log('[buildHierarchyFromFiltered] Output hierarchical:', hierarchical.length);
  return hierarchical;
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

// Sort hierarchical projects while maintaining parent-child relationships
export const sortHierarchicalProjects = (
  projects: Project[], 
  sortField: keyof Project | null, 
  sortDirection: 'asc' | 'desc'
): Project[] => {
  if (!sortField) return projects;
  
  // Helper function to compare values
  const compareValues = (aValue: any, bValue: any) => {
    if (aValue === undefined || aValue === null) aValue = '';
    if (bValue === undefined || bValue === null) bValue = '';
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aStr = String(aValue);
    const bStr = String(bValue);
    return sortDirection === 'asc' 
      ? aStr.localeCompare(bStr) 
      : bStr.localeCompare(aStr);
  };
  
  // Special handling for fields that are SUB-specific
  if (sortField === TableColumnId.PRODUCT_TYPE || sortField === TableColumnId.PRIORITY) {
    // For productType and priority, don't sort MASTER projects
    return projects.map(project => {
      if (project.type === ProjectType.MASTER && project.children && project.children.length > 0) {
        // Keep MASTER in place but sort its SUB children by the field
        return {
          ...project,
          children: [...project.children].sort((a, b) => 
            compareValues(a[sortField], b[sortField])
          )
        };
      } else if (project.type === ProjectType.SUB && !project.parentId) {
        // Independent SUBs will be sorted at the root level
        return project;
      }
      return project;
    }).sort((a, b) => {
      // Only sort independent SUBs at root level, keep MASTERs in original order
      if (a.type === ProjectType.MASTER && b.type === ProjectType.MASTER) {
        return 0; // Keep MASTERs in original order
      }
      if (a.type === ProjectType.MASTER) return -1; // MASTERs always come first
      if (b.type === ProjectType.MASTER) return 1;
      // Both are independent SUBs, sort by the field
      return compareValues(a[sortField], b[sortField]);
    });
  }
  
  // Special handling for financial fields - MASTER uses aggregated values
  if (sortField === TableColumnId.SALES || sortField === TableColumnId.PURCHASE || sortField === TableColumnId.DEPOSIT_PAID) {
    // Sort all projects including MASTERs (which have aggregated values)
    const sortedProjects = [...projects].sort((a, b) => {
      return compareValues(a[sortField], b[sortField]);
    });
    
    // Recursively sort children
    return sortedProjects.map(project => {
      if (project.children && project.children.length > 0) {
        return {
          ...project,
          children: [...project.children].sort((a, b) => 
            compareValues(a[sortField], b[sortField])
          )
        };
      }
      return project;
    });
  }
  
  // For other fields, sort normally
  // Sort projects at the same level
  const sortedProjects = [...projects].sort((a, b) => {
    return compareValues(a[sortField], b[sortField]);
  });
  
  // Recursively sort children
  return sortedProjects.map(project => {
    if (project.children && project.children.length > 0) {
      return {
        ...project,
        children: sortHierarchicalProjects(project.children, sortField, sortDirection)
      };
    }
    return project;
  });
};