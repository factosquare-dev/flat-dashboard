#!/usr/bin/env node

/**
 * 폴더 구조 대대적 개편 스크립트
 * 
 * 새로운 구조:
 * src/
 * ├── app/           (앱 설정, 라우터, 프로바이더)
 * ├── modules/       (기능별 모듈 - 독립적인 기능 단위)
 * │   ├── projects/
 * │   ├── factories/
 * │   ├── users/
 * │   └── schedule/
 * ├── shared/        (공유 컴포넌트, 유틸, 타입)
 * │   ├── components/
 * │   ├── hooks/
 * │   ├── utils/
 * │   └── types/
 * ├── core/          (핵심 비즈니스 로직)
 * │   ├── api/
 * │   ├── store/
 * │   └── services/
 * └── assets/        (정적 파일)
 */

const fs = require('fs-extra');
const path = require('path');

const SRC_DIR = path.join(process.cwd(), 'src');
const BACKUP_DIR = path.join(process.cwd(), 'src_backup');

// 새로운 폴더 구조 매핑
const RESTRUCTURE_MAP = {
  // app - 앱 전체 설정
  'app/router': ['router'],
  'app/providers': ['providers', 'contexts', 'context'],
  'app/layouts': ['layouts'],
  'app/config': ['config'],
  
  // modules - 기능별 모듈
  'modules/projects': [
    'features/projects',
    'pages/Projects',
    'components/ProjectModal',
    'components/ProjectDetailsView'
  ],
  'modules/factories': [
    'features/factories',
    'pages/Factories',
    'components/Factories'
  ],
  'modules/users': [
    'features/users',
    'pages/Users',
    'components/Users'
  ],
  'modules/schedule': [
    'features/schedule',
    'components/Schedule',
    'components/GanttChart',
    'components/Gantt'
  ],
  'modules/customers': [
    'pages/Customers',
    'components/CustomerModal'
  ],
  'modules/products': [
    'features/product-development',
    'components/ProductRequestModal',
    'components/ProductTypes',
    'pages/ProductTypes'
  ],
  'modules/dashboard': [
    'pages/Dashboard'
  ],
  
  // shared - 공유 리소스
  'shared/components': [
    'components/common',
    'components/ui',
    'components/forms',
    'components/Modal',
    'components/ErrorBoundary',
    'components/loading',
    'components/VirtualList',
    'components/OptimizedTable',
    'design-system/components'
  ],
  'shared/hooks': [
    'hooks',
    'features/common/hooks'
  ],
  'shared/utils': [
    'utils'
  ],
  'shared/types': [
    'types',
    'features/common/types'
  ],
  'shared/constants': [
    'constants'
  ],
  'shared/styles': [
    'styles',
    'design-system/styles',
    'design-system/colors'
  ],
  
  // core - 핵심 비즈니스 로직
  'core/api': [
    'api',
    'services/api',
    'mocks/api'
  ],
  'core/store': [
    'store',
    'stores',
    'features/common/store'
  ],
  'core/services': [
    'services',
    'features/common/services',
    'mocks/services'
  ],
  'core/database': [
    'mocks/database',
    'data',
    'mocks/data'
  ],
  'core/validation': [
    'validation'
  ],
  
  // assets
  'assets': ['assets'],
  
  // 기타
  'tests': ['__tests__'],
  'misc': [
    'pages/NotFound',
    'pages/Maintenance',
    'components/examples',
    'errors',
    'mocks/adapters'
  ]
};

// 파일 이동 로그
const moveLog = [];

async function backupSrcFolder() {
  console.log('📦 Creating backup of src folder...');
  if (await fs.pathExists(BACKUP_DIR)) {
    await fs.remove(BACKUP_DIR);
  }
  await fs.copy(SRC_DIR, BACKUP_DIR);
  console.log('✅ Backup created at:', BACKUP_DIR);
}

async function createNewStructure() {
  console.log('\n🏗️  Creating new folder structure...');
  
  const newDirs = Object.keys(RESTRUCTURE_MAP);
  for (const newDir of newDirs) {
    const fullPath = path.join(SRC_DIR, newDir);
    await fs.ensureDir(fullPath);
    console.log(`  📁 Created: ${newDir}`);
  }
}

async function moveFiles() {
  console.log('\n📝 Moving files to new structure...');
  
  for (const [newLocation, oldLocations] of Object.entries(RESTRUCTURE_MAP)) {
    for (const oldLocation of oldLocations) {
      const oldPath = path.join(SRC_DIR, oldLocation);
      const newPath = path.join(SRC_DIR, newLocation);
      
      if (await fs.pathExists(oldPath)) {
        try {
          // Get all files from old location
          const files = await getAllFiles(oldPath);
          
          for (const file of files) {
            const relativePath = path.relative(oldPath, file);
            const destFile = path.join(newPath, relativePath);
            
            // Ensure destination directory exists
            await fs.ensureDir(path.dirname(destFile));
            
            // Move file
            await fs.move(file, destFile, { overwrite: true });
            
            moveLog.push({
              from: path.relative(SRC_DIR, file),
              to: path.relative(SRC_DIR, destFile)
            });
          }
          
          // Remove old empty directory
          await fs.remove(oldPath);
          console.log(`  ✅ Moved: ${oldLocation} -> ${newLocation}`);
        } catch (error) {
          console.error(`  ❌ Error moving ${oldLocation}:`, error.message);
        }
      }
    }
  }
}

async function getAllFiles(dir) {
  const files = [];
  const items = await fs.readdir(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...await getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function cleanupEmptyDirs() {
  console.log('\n🧹 Cleaning up empty directories...');
  
  async function removeEmptyDirs(dir) {
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        await removeEmptyDirs(fullPath);
        
        // Check if directory is empty after recursive cleanup
        const remainingItems = await fs.readdir(fullPath);
        if (remainingItems.length === 0) {
          await fs.remove(fullPath);
          console.log(`  🗑️  Removed empty: ${path.relative(SRC_DIR, fullPath)}`);
        }
      }
    }
  }
  
  await removeEmptyDirs(SRC_DIR);
}

async function saveMoveLog() {
  const logPath = path.join(process.cwd(), 'restructure-log.json');
  await fs.writeJSON(logPath, moveLog, { spaces: 2 });
  console.log(`\n📋 Move log saved to: ${logPath}`);
}

async function main() {
  try {
    console.log('🚀 Starting folder restructure...\n');
    
    // 1. Backup
    await backupSrcFolder();
    
    // 2. Create new structure
    await createNewStructure();
    
    // 3. Move files
    await moveFiles();
    
    // 4. Cleanup
    await cleanupEmptyDirs();
    
    // 5. Save log
    await saveMoveLog();
    
    console.log('\n✨ Folder restructure completed!');
    console.log(`📊 Total files moved: ${moveLog.length}`);
    console.log('\nNext step: Run fix-imports.js to update import paths');
    
  } catch (error) {
    console.error('\n❌ Error during restructure:', error);
    console.log('\n⚠️  You can restore from backup at:', BACKUP_DIR);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { RESTRUCTURE_MAP, moveLog };