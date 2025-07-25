import { useState, useEffect } from 'react';
import { useTaskStore } from '../../../../stores/taskStore';
import type { Project } from '../../../../types/project';

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

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
  
  // Convert schedule tasks to simplified format for TaskList component
  const tasks: Task[] = scheduleTasks.map(task => ({
    id: String(task.id),
    name: task.title || task.taskType || 'Unnamed Task',
    completed: task.status === 'completed'
  }));

  const handleToggleTasks = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleTaskToggle = async (taskId: string) => {
    if (!project) return;
    
    const task = scheduleTasks.find(t => String(t.id) === taskId);
    if (task) {
      const newStatus = task.status === 'completed' ? 'in-progress' : 'completed';
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