/**
 * Debug utility for task date issues
 */

import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import { isToday } from './coreUtils';
import { formatDateLocale } from './unifiedDateUtils';

export function debugTaskDates() {
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    
    // Get all tasks
    const allTasks = Array.from(database.tasks.values());
    
    // Find tasks related to 천연 샴푸 or 사출 성형
    const relevantTasks = allTasks.filter(task => 
      task.title.includes('사출') || 
      task.title.includes('성형') ||
      task.title.includes('천연')
    );
    
    console.log('=== Task Date Debug ===');
    console.log('Current Date (Local):', new Date().toLocaleString());
    console.log('Current Date (ISO):', new Date().toISOString());
    console.log('Today (Local midnight):', new Date().toLocaleDateString());
    
    relevantTasks.forEach(task => {
      const schedule = database.schedules.get(task.scheduleId!);
      const project = schedule ? database.projects.get(schedule.projectId) : null;
      
      console.log('\n--- Task Debug ---');
      console.log('Task:', task.title);
      console.log('Project:', project?.name || 'Unknown');
      console.log('Start Date (raw):', task.startDate);
      console.log('End Date (raw):', task.endDate);
      console.log('Start Date (local):', formatDateLocale(task.startDate, 'short'));
      console.log('End Date (local):', formatDateLocale(task.endDate, 'short'));
      console.log('Status:', task.status);
      console.log('Is Today (start)?', isToday(task.startDate));
      console.log('Is Today (end)?', isToday(task.endDate));
      
      // Check if today falls within task range
      const startDate = new Date(task.startDate + 'T00:00:00Z');
      const endDate = new Date(task.endDate + 'T23:59:59Z');
      const now = new Date();
      const isCurrentTask = startDate <= now && now <= endDate;
      
      console.log('Start Date (UTC to Local):', startDate.toLocaleString());
      console.log('End Date (UTC to Local):', endDate.toLocaleString());
      console.log('Is Current Task?', isCurrentTask);
    });
    
    // Also check 그린코스메틱 projects
    console.log('\n=== 그린코스메틱 Projects ===');
    const greenProjects = Array.from(database.projects.values()).filter(p => 
      p.customerName?.includes('그린') || p.name.includes('천연')
    );
    
    greenProjects.forEach(project => {
      console.log('\nProject:', project.name);
      console.log('ID:', project.id);
      console.log('Status:', project.status);
      console.log('Progress:', project.progress + '%');
      console.log('Start:', project.startDate);
      console.log('End:', project.endDate);
      
      // Find schedule
      const schedule = Array.from(database.schedules.values()).find(s => s.projectId === project.id);
      if (schedule) {
        console.log('Schedule ID:', schedule.id);
        
        // Find tasks
        const projectTasks = allTasks.filter(t => t.scheduleId === schedule.id);
        console.log('Total Tasks:', projectTasks.length);
        
        // Find today's tasks
        const todayTasks = projectTasks.filter(task => {
          const startDate = new Date(task.startDate + 'T00:00:00Z');
          const endDate = new Date(task.endDate + 'T23:59:59Z');
          const now = new Date();
          return startDate <= now && now <= endDate;
        });
        
        console.log('Today\'s Tasks:', todayTasks.map(t => t.title).join(', ') || 'None');
      }
    });
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

// Export for use in console
(window as any).debugTaskDates = debugTaskDates;