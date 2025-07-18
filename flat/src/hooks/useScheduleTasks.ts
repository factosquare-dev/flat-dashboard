import { useState } from 'react';
import type { Task, Participant } from '../types/schedule';

const generateTaskColor = (index: number): string => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-orange-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-lime-500', 'bg-amber-500'
  ];
  return colors[index % colors.length];
};

export const useScheduleTasks = (participants: Participant[], startDate: Date, endDate: Date) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nextTaskId, setNextTaskId] = useState(1);

  const calculateTaskPosition = (taskStartDate: Date, taskEndDate: Date) => {
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceStart = Math.max(0, (taskStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const taskDuration = Math.ceil((taskEndDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const cellWidth = 40;
    const x = daysSinceStart * cellWidth;
    const width = Math.max(cellWidth, taskDuration * cellWidth);
    
    return { x, width };
  };

  const addTask = (task: Omit<Task, 'id' | 'x' | 'width' | 'color'>) => {
    const taskStartDate = new Date(task.startDate);
    const taskEndDate = new Date(task.endDate);
    const { x, width } = calculateTaskPosition(taskStartDate, taskEndDate);
    
    const newTask: Task = {
      ...task,
      id: nextTaskId,
      x,
      width,
      color: generateTaskColor(tasks.length),
      originalStartDate: task.startDate,
      originalEndDate: task.endDate
    };
    
    setTasks([...tasks, newTask]);
    setNextTaskId(nextTaskId + 1);
    
    return newTask;
  };

  const updateTask = (taskId: number, updates: Partial<Task>) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, ...updates };
        
        // Recalculate position if dates changed
        if (updates.startDate || updates.endDate) {
          const taskStartDate = new Date(updates.startDate || task.startDate);
          const taskEndDate = new Date(updates.endDate || task.endDate);
          const { x, width } = calculateTaskPosition(taskStartDate, taskEndDate);
          updatedTask.x = x;
          updatedTask.width = width;
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const reorderTasks = (draggedIndex: number, targetIndex: number, projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const otherTasks = tasks.filter(t => t.projectId !== projectId);
    
    const reorderedProjectTasks = [...projectTasks];
    const [removed] = reorderedProjectTasks.splice(draggedIndex, 1);
    reorderedProjectTasks.splice(targetIndex, 0, removed);
    
    setTasks([...otherTasks, ...reorderedProjectTasks]);
  };

  return {
    tasks,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    calculateTaskPosition
  };
};