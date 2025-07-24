import type { Schedule, Task, Participant } from '../../types/schedule';
import type { Project } from '../../types/project';
import { createScheduleFromProject, createSampleInProgressTasks } from '../../data/projectScheduleData';
import { formatDateISO } from '../../utils/dateUtils';
import { USE_MOCK_DATA } from '../../mocks/mockData';
import { getDatabaseWithRetry } from '../../mocks/database/utils';
// Removed deprecated scheduleAdapter import
import { createMockSchedules } from '../../data/mockSchedules';
import { mockDataService } from '../../services/mockDataService';

/**
 * 프로젝트로부터 스케줄 생성 또는 조회
 */
export const getOrCreateScheduleForProject = async (
  project: Project,
  existingSchedules: Map<string, Schedule>
): Promise<Schedule> => {
  console.log('[getOrCreateScheduleForProject] 1. Called for project:', project.id, project.client ? `${project.client} - ${project.productType}` : 'No name');
  console.log('[getOrCreateScheduleForProject] 2. USE_MOCK_DATA:', USE_MOCK_DATA);
  
  // Use mock database if enabled
  if (USE_MOCK_DATA) {
    console.log('[getOrCreateScheduleForProject] 3. Trying to get database...');
    try {
      const database = await getDatabaseWithRetry();
      console.log('[getOrCreateScheduleForProject] 4. Got database:', !!database);
      
      if (database && database.schedules) {
        console.log('[getOrCreateScheduleForProject] 5. Database has schedules');
        const schedules = Array.from(database.schedules.values());
        console.log('[getOrCreateScheduleForProject] 6. Number of schedules in DB:', schedules.length);
        const existingSchedule = schedules.find(s => s.projectId === project.id);
        console.log('[getOrCreateScheduleForProject] 7. Found existing schedule:', !!existingSchedule);
        
        if (existingSchedule) {
          console.log('[getOrCreateScheduleForProject] 8. Returning existing schedule from DB');
          
          // Get assigned factory IDs for this project
          const assignedFactoryIds = new Set<string>();
          if (projectData) {
            if (projectData.manufacturerId) assignedFactoryIds.add(projectData.manufacturerId);
            if (projectData.containerId) assignedFactoryIds.add(projectData.containerId);
            if (projectData.packagingId) assignedFactoryIds.add(projectData.packagingId);
          }
          
          // Get tasks for this schedule - filter by assigned factories
          const scheduleTasks = Array.from(database.tasks.values())
            .filter(task => task.scheduleId === existingSchedule.id && assignedFactoryIds.has(task.factoryId))
            .map(task => {
              // Get factory name from factoryId
              const factory = database.factories.get(task.factoryId);
              const factoryColor = factory?.type === 'MANUFACTURING' ? 'blue' : 
                                   factory?.type === 'CONTAINER' ? 'red' : 
                                   factory?.type === 'PACKAGING' ? 'yellow' : 'gray';
              
              return {
                id: task.id,
                projectId: task.projectId,
                factory: factory?.name || '',
                factoryId: task.factoryId,
                taskType: task.title,
                startDate: typeof task.startDate === 'string' ? task.startDate : task.startDate.toISOString().split('T')[0],
                endDate: typeof task.endDate === 'string' ? task.endDate : task.endDate.toISOString().split('T')[0],
                status: task.status.toLowerCase().replace('_', '-'),
                assignee: task.assignee || '',
                color: factoryColor
              };
            });
          
          // Get participants from project factories
          const participants = [];
          const projectData = database.projects.get(existingSchedule.projectId);
          
          if (projectData) {
            if (projectData.manufacturerId && projectData.manufacturerId !== null) {
              const factory = database.factories.get(projectData.manufacturerId);
              if (factory) {
                participants.push({
                  id: factory.id,
                  name: factory.name,
                  period: `${existingSchedule.startDate} ~ ${existingSchedule.endDate}`,
                  color: 'blue'
                });
              }
            }
            
            if (projectData.containerId && projectData.containerId !== null) {
              const factory = database.factories.get(projectData.containerId);
              if (factory) {
                participants.push({
                  id: factory.id,
                  name: factory.name,
                  period: `${existingSchedule.startDate} ~ ${existingSchedule.endDate}`,
                  color: 'red'
                });
              }
            }
            
            if (projectData.packagingId && projectData.packagingId !== null) {
              const factory = database.factories.get(projectData.packagingId);
              if (factory) {
                participants.push({
                  id: factory.id,
                  name: factory.name,
                  period: `${existingSchedule.startDate} ~ ${existingSchedule.endDate}`,
                  color: 'yellow'
                });
              }
            }
          }
          
          return {
            id: existingSchedule.id,
            projectId: existingSchedule.projectId,
            participants: participants,
            tasks: scheduleTasks,
            startDate: typeof existingSchedule.startDate === 'string' ? existingSchedule.startDate : existingSchedule.startDate.toISOString().split('T')[0],
            endDate: typeof existingSchedule.endDate === 'string' ? existingSchedule.endDate : existingSchedule.endDate.toISOString().split('T')[0],
            createdAt: typeof existingSchedule.createdAt === 'string' ? existingSchedule.createdAt : existingSchedule.createdAt.toISOString(),
            updatedAt: typeof existingSchedule.updatedAt === 'string' ? existingSchedule.updatedAt : existingSchedule.updatedAt.toISOString()
          };
        }
      }
    } catch (error) {
      console.log('[getOrCreateScheduleForProject] 9. Error in mock database section:', error);
      // Fall through to old logic
    }
  }
  
  console.log('[getOrCreateScheduleForProject] 10. Continuing to fallback logic...');
  
  // Fallback: Create schedule with mock tasks for development
  
  // Get mock schedules and find tasks for this specific project
  console.log('[getOrCreateScheduleForProject] 11. About to create mock schedules...');
  let mockSchedules: Schedule[] = [];
  try {
    mockSchedules = createMockSchedules();
    console.log('[getOrCreateScheduleForProject] 12. Created mock schedules:', mockSchedules.length);
    console.log('[getOrCreateScheduleForProject] 13. Available mock schedules:', mockSchedules.map(s => ({ id: s.id, projectId: s.projectId, name: s.name })));
  } catch (error) {
    console.log('[getOrCreateScheduleForProject] 14. Error creating mock schedules:', error);
  }
  
  console.log('[getOrCreateScheduleForProject] 15. Looking for mockSchedule with projectId:', project.id);
  const mockSchedule = mockSchedules.find(s => s.projectId === project.id);
  
  if (!mockSchedule) {
    console.log('[getOrCreateScheduleForProject] 16. No mockSchedule found for projectId:', project.id);
  } else {
    console.log('[getOrCreateScheduleForProject] 17. Found mockSchedule:', mockSchedule.id);
  }
  
  console.log('[getOrCreateScheduleForProject] 18. Setting up project dates...');
  // Filter tasks to fit within project dates
  const projectStart = new Date(project.startDate);
  const projectEnd = new Date(project.endDate);
  console.log('[getOrCreateScheduleForProject] 19. Project dates:', project.startDate, 'to', project.endDate);
  
  console.log('[getOrCreateScheduleForProject] 20. Creating task arrays...');
  // Create non-overlapping tasks within each factory
  let globalTaskId = 1;
  const filteredTasks: any[] = [];
  
  
  if (mockSchedule) {
    console.log('[getOrCreateScheduleForProject] 21. Found mockSchedule:', mockSchedule.id);
    console.log('[getOrCreateScheduleForProject] 22. mockSchedule.tasks:', mockSchedule.tasks.length);
    
    // Filter tasks that belong to this project only
    const projectTasks = mockSchedule.tasks.filter(task => 
      task.projectId === project.id
    );
    
    console.log('[getOrCreateScheduleForProject] 23. Filtered tasks for project', project.id, ':', projectTasks.length);
    
    // Get assigned factories for this project
    const assignedFactoryIds = new Set<string>();
    if (project.manufacturer) {
      const factory = allFactories.find(f => f.id === project.manufacturer || f.name === project.manufacturer);
      if (factory) assignedFactoryIds.add(factory.id);
    }
    if (project.container) {
      const factory = allFactories.find(f => f.id === project.container || f.name === project.container);
      if (factory) assignedFactoryIds.add(factory.id);
    }
    if (project.packaging) {
      const factory = allFactories.find(f => f.id === project.packaging || f.name === project.packaging);
      if (factory) assignedFactoryIds.add(factory.id);
    }
    
    console.log('[getOrCreateScheduleForProject] 24. Assigned factory IDs:', Array.from(assignedFactoryIds));
    
    // Filter tasks to only include those from assigned factories
    const validProjectTasks = projectTasks.filter(task => {
      if (!task.factoryId) {
        console.warn('[getOrCreateScheduleForProject] Task', task.id, 'has no factoryId');
        return false;
      }
      const isValid = assignedFactoryIds.has(task.factoryId);
      if (!isValid) {
        console.log('[getOrCreateScheduleForProject] Filtering out task', task.id, 'from factory', task.factoryId, 'not assigned to project');
      }
      return isValid;
    });
    
    console.log('[getOrCreateScheduleForProject] 25. Valid tasks after factory filtering:', validProjectTasks.length);
    
    // Group tasks by factory
    const tasksByFactory = new Map<string, any[]>();
    validProjectTasks.forEach(task => {
      const factory = task.factory || 'Unknown';
      if (!tasksByFactory.has(factory)) {
        tasksByFactory.set(factory, []);
      }
      tasksByFactory.get(factory)!.push(task);
    });
    
    // Process each factory's tasks separately to avoid overlaps within the same factory
    tasksByFactory.forEach((factoryTasks, factoryName) => {
      const factory = mockSchedule.participants.find(p => p.name === factoryName);
      let lastEndDateForFactory = new Date(projectStart);
      
      
      // Sort tasks by original start date
      const sortedFactoryTasks = [...factoryTasks].sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      
      sortedFactoryTasks.forEach((task, index) => {
        const taskDuration = Math.ceil(
          (new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // For each factory, ensure no overlap within that factory
        let newStartDate: Date;
        if (index === 0) {
          // First task starts at project start
          newStartDate = new Date(projectStart);
        } else {
          // Subsequent tasks start after previous task ends
          newStartDate = new Date(lastEndDateForFactory);
          newStartDate.setDate(newStartDate.getDate() + 2); // Add 2 day gap between tasks
        }
        
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newEndDate.getDate() + Math.max(3, taskDuration)); // Minimum 3 days per task
        
        // Check if task fits within project timeline
        if (newEndDate <= projectEnd) {
          const newTask = {
            ...task,
            id: globalTaskId++,
            projectId: project.id,
            factoryId: factory?.id || `factory-unknown`,
            startDate: formatDateISO(newStartDate),
            endDate: formatDateISO(newEndDate)
          };
          
          
          filteredTasks.push(newTask);
          
          lastEndDateForFactory = newEndDate;
        }
      });
    });
  }
  
  // Get participants based on project's factories
  const participants: Participant[] = [];
  let allFactories: any[] = [];
  
  try {
    allFactories = mockDataService.getAllFactories();
    console.log('[getOrCreateScheduleForProject] 26. All factories:', allFactories.length);
  } catch (error) {
    console.log('[getOrCreateScheduleForProject] 27. Error getting factories:', error);
  }
  
  if (project.manufacturer && project.manufacturer !== 'null') {
    // Try to find by ID first, then by name
    const factory = allFactories.find(f => f.id === project.manufacturer || f.name === project.manufacturer);
    if (factory) {
      participants.push({
        id: factory.id,
        name: factory.name,
        period: `${project.startDate} ~ ${project.endDate}`,
        color: 'blue'
      });
    }
  }
  
  if (project.container && project.container !== 'null') {
    // Try to find by ID first, then by name
    const factory = allFactories.find(f => f.id === project.container || f.name === project.container);
    if (factory) {
      participants.push({
        id: factory.id,
        name: factory.name,
        period: `${project.startDate} ~ ${project.endDate}`,
        color: 'red'
      });
    }
  }
  
  if (project.packaging && project.packaging !== 'null') {
    // Try to find by ID first, then by name
    const factory = allFactories.find(f => f.id === project.packaging || f.name === project.packaging);
    if (factory) {
      participants.push({
        id: factory.id,
        name: factory.name,
        period: `${project.startDate} ~ ${project.endDate}`,
        color: 'yellow'
      });
    }
  }
  
  const newSchedule: Schedule = {
    id: `schedule-${project.id}-${Date.now()}`,
    projectId: project.id,
    participants: participants,
    tasks: filteredTasks,
    startDate: project.startDate,
    endDate: project.endDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  console.log('[getOrCreateScheduleForProject] 28. Created schedule with', participants.length, 'participants and', filteredTasks.length, 'tasks');
  console.log('[getOrCreateScheduleForProject] 29. Participants:', participants.map(p => ({ id: p.id, name: p.name })));
  console.log('[getOrCreateScheduleForProject] 30. Project factories - manufacturer:', project.manufacturer, 'container:', project.container, 'packaging:', project.packaging);
  
  
  if (USE_MOCK_DATA) {
    existingSchedules.set(newSchedule.id, newSchedule);
  }
  
  return newSchedule;
};

/**
 * 스케줄에 태스크 추가
 */
export const addTaskToSchedule = (
  schedule: Schedule,
  task: Omit<Task, 'id'>
): Schedule => {
  const newTaskId = Math.max(...schedule.tasks.map(t => 
    typeof t.id === 'number' ? t.id : parseInt(String(t.id)) || 0
  )) + 1;
  
  const newTask: Task = {
    ...task,
    id: newTaskId
  };
  
  return {
    ...schedule,
    tasks: [...schedule.tasks, newTask],
    updatedAt: new Date().toISOString()
  };
};

/**
 * 스케줄에서 태스크 업데이트
 */
export const updateTaskInSchedule = (
  schedule: Schedule,
  taskId: number | string,
  updates: Partial<Task>
): Schedule | null => {
  const taskIndex = schedule.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return null;
  
  const updatedTasks = [...schedule.tasks];
  updatedTasks[taskIndex] = {
    ...updatedTasks[taskIndex],
    ...updates
  };
  
  return {
    ...schedule,
    tasks: updatedTasks,
    updatedAt: new Date().toISOString()
  };
};

/**
 * 스케줄에서 태스크 삭제
 */
export const deleteTaskFromSchedule = (
  schedule: Schedule,
  taskId: number | string
): Schedule => {
  return {
    ...schedule,
    tasks: schedule.tasks.filter(t => t.id !== taskId),
    updatedAt: new Date().toISOString()
  };
};