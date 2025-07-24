import { useState } from 'react';
import { TASK_TEMPLATES } from '../../../../constants';

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

export const useTaskManagement = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Default tasks based on the image
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: TASK_TEMPLATES.RAW_MATERIAL_PREP, completed: true },
    { id: '2', name: TASK_TEMPLATES.MIXING_MANUFACTURING, completed: true },
    { id: '3', name: TASK_TEMPLATES.MOLD_MAKING, completed: true },
    { id: '4', name: TASK_TEMPLATES.STABILITY_TEST, completed: false },
    { id: '5', name: TASK_TEMPLATES.TRIAL_MOLDING, completed: false },
    { id: '6', name: TASK_TEMPLATES.DESIGN_WORK, completed: false },
    { id: '7', name: TASK_TEMPLATES.PACKAGING_WORK, completed: false }
  ]);

  const handleToggleTasks = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleTaskToggle = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return {
    isExpanded,
    tasks,
    handleToggleTasks,
    handleTaskToggle
  };
};