import { MockDatabaseImpl } from '../mocks/database/MockDatabase';
import type { Project } from '../types/project';

export function debugHierarchyIssue() {
  console.log('=== Debugging Hierarchy Issue ===');
  
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    
    if (!database || !database.projects) {
      console.error('Database not initialized');
      return;
    }
    
    const projects = Array.from(database.projects.values());
    
    // 1. Check for MASTER projects with parentId
    console.log('\n1. Checking for MASTER projects with parentId:');
    const masterWithParent = projects.filter(p => p.type === 'MASTER' && p.parentId);
    if (masterWithParent.length > 0) {
      console.error('❌ Found MASTER projects with parentId:', masterWithParent.map(p => ({
        id: p.id,
        name: p.name,
        parentId: p.parentId,
        type: p.type
      })));
    } else {
      console.log('✅ No MASTER projects have parentId');
    }
    
    // 2. Check for SUB projects without parentId (This is allowed - independent SUB projects)
    console.log('\n2. Checking for independent SUB projects:');
    const subWithoutParent = projects.filter(p => p.type === 'SUB' && !p.parentId);
    if (subWithoutParent.length > 0) {
      console.log('ℹ️ Found independent SUB projects (without parentId):', subWithoutParent.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type
      })));
    } else {
      console.log('ℹ️ No independent SUB projects found');
    }
    
    // 3. Check for SUB projects whose parent is not MASTER
    console.log('\n3. Checking SUB projects parent types:');
    const subProjects = projects.filter(p => p.type === 'SUB');
    const invalidParents: any[] = [];
    
    subProjects.forEach(sub => {
      const parent = projects.find(p => p.id === sub.parentId);
      if (!parent) {
        invalidParents.push({
          sub: { id: sub.id, name: sub.name, parentId: sub.parentId },
          issue: 'Parent not found'
        });
      } else if (parent.type !== 'MASTER') {
        invalidParents.push({
          sub: { id: sub.id, name: sub.name, parentId: sub.parentId },
          parent: { id: parent.id, name: parent.name, type: parent.type },
          issue: 'Parent is not MASTER'
        });
      }
    });
    
    if (invalidParents.length > 0) {
      console.error('❌ Found SUB projects with invalid parents:', invalidParents);
    } else {
      console.log('✅ All SUB projects have valid MASTER parents');
    }
    
    // 4. Check for circular references
    console.log('\n4. Checking for circular references:');
    const hasCircularRef = projects.some(project => {
      const visited = new Set<string>();
      let current = project;
      
      while (current.parentId) {
        if (visited.has(current.id)) {
          console.error('❌ Circular reference detected:', {
            projectId: project.id,
            projectName: project.name,
            visitedChain: Array.from(visited)
          });
          return true;
        }
        visited.add(current.id);
        current = projects.find(p => p.id === current.parentId)!;
        if (!current) break;
      }
      
      return false;
    });
    
    if (!hasCircularRef) {
      console.log('✅ No circular references found');
    }
    
    // 5. Display the actual hierarchy
    console.log('\n5. Actual Hierarchy Structure:');
    const masterProjects = projects.filter(p => p.type === 'MASTER' && !p.parentId);
    
    masterProjects.forEach(master => {
      console.log(`\n📁 MASTER: ${master.name} (${master.id})`);
      const children = projects.filter(p => p.parentId === master.id);
      
      children.forEach(child => {
        console.log(`  └─ ${child.type}: ${child.name} (${child.id})`);
        
        // Check if this child has any children (which would be the issue)
        const grandchildren = projects.filter(p => p.parentId === child.id);
        if (grandchildren.length > 0) {
          console.error(`    ❌ UNEXPECTED: This ${child.type} has children!`);
          grandchildren.forEach(gc => {
            console.error(`      └─ ${gc.type}: ${gc.name} (${gc.id})`);
          });
        }
      });
    });
    
    // 6. Check the hierarchicalProjects.ts logic
    console.log('\n6. Testing hierarchicalProjects.ts logic:');
    const testMasterProjects = projects.filter(p => p.type === 'MASTER' && !p.parentId);
    console.log(`Found ${testMasterProjects.length} MASTER projects without parentId`);
    
    testMasterProjects.forEach(master => {
      const testSubProjects = projects.filter(p => p.type === 'SUB' && p.parentId === master.id);
      console.log(`MASTER ${master.name} has ${testSubProjects.length} SUB children`);
    });
    
  } catch (error) {
    console.error('Error during debugging:', error);
  }
}

// Function to fix the hierarchy if issues are found
export function fixHierarchyIssues() {
  console.log('\n=== Attempting to Fix Hierarchy Issues ===');
  
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    
    if (!database || !database.projects) {
      console.error('Database not initialized');
      return;
    }
    
    const projects = Array.from(database.projects.values());
    let fixCount = 0;
    
    // Fix MASTER projects with parentId
    projects.forEach(project => {
      if (project.type === 'MASTER' && project.parentId) {
        console.log(`Fixing: Removing parentId from MASTER project ${project.name}`);
        delete project.parentId;
        database.projects.set(project.id, project);
        fixCount++;
      }
    });
    
    if (fixCount > 0) {
      console.log(`✅ Fixed ${fixCount} hierarchy issues`);
    } else {
      console.log('✅ No hierarchy issues found to fix');
    }
    
  } catch (error) {
    console.error('Error fixing hierarchy:', error);
  }
}