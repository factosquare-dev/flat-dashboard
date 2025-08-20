import { useState, useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import type { Project } from '@/types/project';
import { TaskStatus } from '@/types/enums';

interface UseTaskManagementProps {
  project?: Project;
}

export const useTaskManagement = (props?: UseTaskManagementProps) => {
  const project = props?.project;
  const [isExpanded, setIsExpanded] = useState(false);
  const { getTasksForProject, updateTask, loadScheduleForProject } = useTaskStore();
  
  // Load schedule and tasks when component mounts
  useEffect(() => {
    if (project) {
      loadScheduleForProject(project);
    }
  }, [project, loadScheduleForProject]);
  
  // Get tasks from store
  const scheduleTasks = project ? getTasksForProject(project.id) : [];
  
  // Pass full task information to TaskList
  const tasks = scheduleTasks;

  const handleToggleTasks = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsExpanded(!isExpanded);
  };

  const handleTaskToggle = async (taskId: string) => {
    if (!project) return;
    
    const task = scheduleTasks.find(t => String(t.id) === taskId);
    if (task) {
      const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.IN_PROGRESS : TaskStatus.COMPLETED;
      await updateTask(project.id, task.id, { status: newStatus });
    }
  };

  return {
    isExpanded,
    tasks,
    handleToggleTasks,
    handleTaskToggle
  };
};