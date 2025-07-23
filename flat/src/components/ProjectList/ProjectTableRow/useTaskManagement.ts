import { useState } from 'react';

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

export const useTaskManagement = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Default tasks based on the image
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: '원료 준비', completed: true },
    { id: '2', name: '혼합 및 제조', completed: true },
    { id: '3', name: '금형 제작', completed: true },
    { id: '4', name: '안정성 테스트', completed: false },
    { id: '5', name: '시홍 성형', completed: false },
    { id: '6', name: '디자인 작업', completed: false },
    { id: '7', name: '포장 작업', completed: false }
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