#!/usr/bin/env node

/**
 * Import 경로 자동 수정 스크립트
 * 폴더 구조 변경 후 모든 import 경로를 새로운 구조에 맞게 수정
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const SRC_DIR = path.join(process.cwd(), 'flat/src');

// Import 경로 매핑 규칙
const IMPORT_MAPPINGS = {
  // Features to Modules
  '@/features/projects': '@/modules/projects',
  '@/features/factories': '@/modules/factories',
  '@/features/users': '@/modules/users',
  '@/features/schedule': '@/modules/schedule',
  '@/features/product-development': '@/modules/products',
  '@/features/common': '@/shared',
  
  // Pages to Modules
  '@/pages/Projects': '@/modules/projects/pages',
  '@/pages/Factories': '@/modules/factories/pages',
  '@/pages/Users': '@/modules/users/pages',
  '@/pages/Customers': '@/modules/customers/pages',
  '@/pages/ProductTypes': '@/modules/products/pages',
  '@/pages/Dashboard': '@/modules/dashboard/pages',
  
  // Components to appropriate locations
  '@/components/ProjectModal': '@/modules/projects/components',
  '@/components/ProjectDetailsView': '@/modules/projects/components',
  '@/components/Factories': '@/modules/factories/components',
  '@/components/Users': '@/modules/users/components',
  '@/components/Schedule': '@/modules/schedule/components',
  '@/components/GanttChart': '@/modules/schedule/components',
  '@/components/CustomerModal': '@/modules/customers/components',
  '@/components/ProductRequestModal': '@/modules/products/components',
  '@/components/ProductTypes': '@/modules/products/components',
  
  // Common components
  '@/components/common': '@/shared/components',
  '@/components/ui': '@/shared/components/ui',
  '@/components/forms': '@/shared/components/forms',
  '@/components/Modal': '@/shared/components/Modal',
  '@/components/ErrorBoundary': '@/shared/components/ErrorBoundary',
  '@/components/loading': '@/shared/components/loading',
  
  // Core mappings
  '@/api': '@/core/api',
  '@/services/api': '@/core/api',
  '@/services': '@/core/services',
  '@/store': '@/core/store',
  '@/stores': '@/core/store',
  '@/mocks/api': '@/core/api/mocks',
  '@/mocks/services': '@/core/services/mocks',
  '@/mocks/database': '@/core/database',
  '@/data': '@/core/database/data',
  
  // Shared mappings
  '@/hooks': '@/shared/hooks',
  '@/utils': '@/shared/utils',
  '@/types': '@/shared/types',
  '@/constants': '@/shared/constants',
  '@/validation': '@/core/validation',
  
  // App mappings
  '@/router': '@/app/router',
  '@/providers': '@/app/providers',
  '@/contexts': '@/app/providers',
  '@/context': '@/app/providers',
  '@/layouts': '@/app/layouts',
  '@/config': '@/app/config',
  
  // Design system
  '@/design-system': '@/shared/styles',
  '@/styles': '@/shared/styles',
};

// 상대 경로 import를 절대 경로로 변환하는 매핑
const RELATIVE_TO_ABSOLUTE_MAP = new Map();

async function getAllTypeScriptFiles() {
  return new Promise((resolve, reject) => {
    glob(path.join(SRC_DIR, '**/*.{ts,tsx,js,jsx}'), (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}

function updateImportPaths(content, filePath) {
  let updatedContent = content;
  let changeCount = 0;
  
  // Regular expression to match import statements
  const importRegex = /^(import\s+(?:[\w\s{},*]+\s+from\s+)?['"])([^'"]+)(['"])/gm;
  const dynamicImportRegex = /(import\s*\(\s*['"])([^'"]+)(['"])/g;
  const requireRegex = /(require\s*\(\s*['"])([^'"]+)(['"])/g;
  
  function replaceImport(match, prefix, importPath, suffix) {
    let newPath = importPath;
    
    // Check if it's an alias import (@/)
    if (importPath.startsWith('@/')) {
      // Try to find mapping
      for (const [oldPath, newPath] of Object.entries(IMPORT_MAPPINGS)) {
        if (importPath.startsWith(oldPath)) {
          const replaced = importPath.replace(oldPath, newPath);
          changeCount++;
          return prefix + replaced + suffix;
        }
      }
    }
    
    // Handle relative imports
    if (importPath.startsWith('.')) {
      const currentDir = path.dirname(filePath);
      const absolutePath = path.resolve(currentDir, importPath);
      const relativeToProjRoot = path.relative(SRC_DIR, absolutePath);
      
      // Check if this relative path needs to be updated
      for (const [oldPath, newPath] of Object.entries(IMPORT_MAPPINGS)) {
        const oldPathClean = oldPath.replace('@/', '');
        if (relativeToProjRoot.startsWith(oldPathClean)) {
          const newRelativePath = relativeToProjRoot.replace(oldPathClean, newPath.replace('@/', ''));
          const newAbsolutePath = path.join(SRC_DIR, newRelativePath);
          const newRelativeImport = path.relative(currentDir, newAbsolutePath);
          changeCount++;
          return prefix + (newRelativeImport.startsWith('.') ? newRelativeImport : './' + newRelativeImport) + suffix;
        }
      }
    }
    
    return match;
  }
  
  // Update all import types
  updatedContent = updatedContent.replace(importRegex, replaceImport);
  updatedContent = updatedContent.replace(dynamicImportRegex, replaceImport);
  updatedContent = updatedContent.replace(requireRegex, replaceImport);
  
  return { updatedContent, changeCount };
}

async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const { updatedContent, changeCount } = updateImportPaths(content, filePath);
    
    if (changeCount > 0) {
      await fs.writeFile(filePath, updatedContent);
      console.log(`  ✅ Updated ${changeCount} imports in: ${path.relative(SRC_DIR, filePath)}`);
      return changeCount;
    }
    
    return 0;
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

async function generateIndexFiles() {
  console.log('\n📝 Generating index files for modules...');
  
  const modules = ['projects', 'factories', 'users', 'schedule', 'customers', 'products', 'dashboard'];
  
  for (const module of modules) {
    const modulePath = path.join(SRC_DIR, 'modules', module);
    const indexPath = path.join(modulePath, 'index.ts');
    
    if (await fs.pathExists(modulePath)) {
      const indexContent = `/**
 * ${module.charAt(0).toUpperCase() + module.slice(1)} Module
 * Auto-generated index file
 */

// Export all components
export * from './components';

// Export all hooks
export * from './hooks';

// Export all types
export * from './types';

// Export all services
export * from './services';

// Export all stores
export * from './store';
`;
      
      await fs.writeFile(indexPath, indexContent);
      console.log(`  ✅ Created index for: ${module}`);
    }
  }
}

async function updateTsConfig() {
  console.log('\n⚙️  Updating tsconfig.json paths...');
  
  const tsconfigPath = path.join(process.cwd(), 'flat/tsconfig.json');
  const tsconfig = await fs.readJSON(tsconfigPath);
  
  // Update path mappings
  tsconfig.compilerOptions.paths = {
    "@/*": ["./src/*"],
    "@/app/*": ["./src/app/*"],
    "@/modules/*": ["./src/modules/*"],
    "@/shared/*": ["./src/shared/*"],
    "@/core/*": ["./src/core/*"],
    "@/assets/*": ["./src/assets/*"]
  };
  
  await fs.writeJSON(tsconfigPath, tsconfig, { spaces: 2 });
  console.log('  ✅ Updated tsconfig.json');
}

async function main() {
  try {
    console.log('🚀 Starting import path fixes...\n');
    
    // Get all TypeScript/JavaScript files
    const files = await getAllTypeScriptFiles();
    console.log(`📁 Found ${files.length} files to process\n`);
    
    // Process each file
    let totalChanges = 0;
    for (const file of files) {
      const changes = await processFile(file);
      totalChanges += changes;
    }
    
    // Generate index files
    await generateIndexFiles();
    
    // Update tsconfig
    await updateTsConfig();
    
    console.log('\n✨ Import path fixes completed!');
    console.log(`📊 Total imports updated: ${totalChanges}`);
    
  } catch (error) {
    console.error('\n❌ Error during import fixes:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { IMPORT_MAPPINGS };