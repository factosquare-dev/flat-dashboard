import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';
import type { Project } from '@/types/project';
import { ProjectType } from '@/types/enums';

export function debugHierarchyIssue() {
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    
    if (!database || !database.projects) {
      return;
    }
    
    const projects = Array.from(database.projects.values());
    
    // 1. Check for MASTER projects with parentId
    const masterWithParent = projects.filter(p => p.type === ProjectType.MASTER && p.parentId);
    
    // 2. Check for SUB projects without parentId (This is allowed - independent SUB projects)
    const subWithoutParent = projects.filter(p => p.type === ProjectType.SUB && !p.parentId);
    
    // 3. Check for SUB projects whose parent is not MASTER
    const subProjects = projects.filter(p => p.type === ProjectType.SUB);
    const invalidParents: any[] = [];
    
    subProjects.forEach(sub => {
      const parent = projects.find(p => p.id === sub.parentId);
      if (!parent) {
        invalidParents.push({
          sub: { id: sub.id, name: sub.name, parentId: sub.parentId },
          issue: 'Parent not found'
        });
      } else if (parent.type !== ProjectType.MASTER) {
        invalidParents.push({
          sub: { id: sub.id, name: sub.name, parentId: sub.parentId },
          parent: { id: parent.id, name: parent.name, type: parent.type },
          issue: 'Parent is not MASTER'
        });
      }
    });
    
    // 4. Check for circular references
    const hasCircularRef = projects.some(project => {
      const visited = new Set<string>();
      let current = project;
      
      while (current.parentId) {
        if (visited.has(current.id)) {
          return true;
        }
        visited.add(current.id);
        current = projects.find(p => p.id === current.parentId)!;
        if (!current) break;
      }
      
      return false;
    });
    
    // 5. Display the actual hierarchy
    const masterProjects = projects.filter(p => p.type === ProjectType.MASTER && !p.parentId);
    
    masterProjects.forEach(master => {
      const children = projects.filter(p => p.parentId === master.id);
      
      children.forEach(child => {
        // Check if this child has any children (which would be the issue)
        const grandchildren = projects.filter(p => p.parentId === child.id);
      });
    });
    
    // 6. Check the hierarchicalProjects.ts logic
    const testMasterProjects = projects.filter(p => p.type === ProjectType.MASTER && !p.parentId);
    
    testMasterProjects.forEach(master => {
      const testSubProjects = projects.filter(p => p.type === ProjectType.SUB && p.parentId === master.id);
    });
    
  } catch (error) {
    // Silent fail
  }
}

// Function to fix the hierarchy if issues are found
export function fixHierarchyIssues() {
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    
    if (!database || !database.projects) {
      return;
    }
    
    const projects = Array.from(database.projects.values());
    let fixCount = 0;
    
    // Fix MASTER projects with parentId
    projects.forEach(project => {
      if (project.type === ProjectType.MASTER && project.parentId) {
        delete project.parentId;
        database.projects.set(project.id, project);
        fixCount++;
      }
    });
    
  } catch (error) {
    // Silent fail
  }
}