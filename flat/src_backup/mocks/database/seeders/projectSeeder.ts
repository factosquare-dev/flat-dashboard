import { Project } from '@/types/project';
import { Customer } from '@/types/customer';
import { User } from '@/types/user';
import { createMasterProjects } from './projects/masterProjects';
import { createLinkedSubProjects } from './projects/linkedSubProjects';
import { createIndependentSubProjects } from './projects/independentSubProjects';

export const createProjects = (customers: Customer[], users: User[]): Project[] => {
  const currentDate = new Date();
  
  // Find specific users for consistency
  const pmUser = users.find(u => u.id === 'user-2')!; // 이영희
  const pmUser2 = users.find(u => u.id === 'user-6')!; // 강미나
  const customer1 = customers.find(c => c.id === 'customer-1')!;
  const customer2 = customers.find(c => c.id === 'customer-2')!;
  const customer3 = customers.find(c => c.id === 'customer-3')!;
  const customer4 = customers.find(c => c.id === 'customer-4')!;

  // Create synchronized project dates dynamically
  const { masterProjects, subProjects } = createSynchronizedProjects(
    [customer1, customer2, customer3, customer4], 
    [pmUser, pmUser2], 
    currentDate
  );

  return [...masterProjects, ...subProjects];
};

/**
 * Creates synchronized Master and Sub projects with various statuses
 */
function createSynchronizedProjects(
  customers: Customer[], 
  pmUsers: User[], 
  currentDate: Date
) {
  // Create master projects
  const masterProjects = createMasterProjects(customers, pmUsers, currentDate);
  
  // Calculate master project dates for linked sub projects
  const master1Start = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  master1Start.setUTCDate(master1Start.getUTCDate() - 30);
  const master1End = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  master1End.setUTCDate(master1End.getUTCDate() + 60);
  
  const master2Start = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  master2Start.setUTCDate(master2Start.getUTCDate() - 45);
  const master2End = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));
  master2End.setUTCDate(master2End.getUTCDate() + 75);
  
  // Create linked sub projects
  const linkedSubProjects = createLinkedSubProjects(
    customers, 
    pmUsers, 
    currentDate,
    master1Start,
    master1End,
    master2Start,
    master2End
  );
  
  // Create independent sub projects
  const independentSubProjects = createIndependentSubProjects(customers, pmUsers, currentDate);
  
  return { 
    masterProjects,
    subProjects: [...linkedSubProjects, ...independentSubProjects]
  };
}