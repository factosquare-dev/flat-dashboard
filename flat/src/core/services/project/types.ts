/**
 * Shared types for Project services
 */

import { Project } from '@/shared/types/project';
import { User } from '@/shared/types/user';
import { Factory } from '@/shared/types/factory';
import { Schedule, Task } from '@/shared/types/schedule';
import type { Comment } from '@/shared/types/comment';

export interface ProjectWithRelations extends Project {
  users?: Array<User & { role: string; assignedAt: Date }>;
  factories?: {
    manufacturer?: Factory;
    container?: Factory;
    packaging?: Factory;
  };
  schedule?: Schedule;
  tasks?: Task[];
  comments?: Comment[];
  subProjects?: Project[];
  parentProject?: Project;
}

export interface CreateProjectData extends Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'scheduleId'> {
  assignedUsers?: Array<{ userId: string; role: 'manager' | 'member' | 'viewer' }>;
}