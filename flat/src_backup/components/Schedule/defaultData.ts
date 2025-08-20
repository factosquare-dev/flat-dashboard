import type { Participant } from '@/types/schedule';
import { formatDate } from '@/utils/formatUtils';
import { TASK_COLORS } from './constants';

export const createDefaultProjects = (today: Date): Participant[] => {
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  return [
    {
      id: 'project-1',
      name: 'Project Alpha',
      period: `${formatDate(today)} ~ ${formatDate(addDays(today, 90))}`,
      color: TASK_COLORS.blue,
    },
    {
      id: 'project-2',
      name: 'Project Beta',
      period: `${formatDate(addDays(today, 14))} ~ ${formatDate(addDays(today, 45))}`,
      color: TASK_COLORS.red,
    },
    {
      id: 'project-3',
      name: 'Project Gamma',
      period: `${formatDate(addDays(today, 7))} ~ ${formatDate(addDays(today, 60))}`,
      color: TASK_COLORS.yellow,
    },
    {
      id: 'project-4',
      name: 'Project Delta',
      period: `${formatDate(addDays(today, 3))} ~ ${formatDate(addDays(today, 75))}`,
      color: TASK_COLORS.cyan,
    },
  ];
};