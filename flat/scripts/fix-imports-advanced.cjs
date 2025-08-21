#!/usr/bin/env node

/**
 * 고급 Import 경로 자동 수정 스크립트
 * 모든 import 케이스를 처리하는 완벽한 버전
 */

const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');
const ts = require('typescript');

const SRC_DIR = path.join(process.cwd(), 'src');
const LOG_FILE = path.join(process.cwd(), 'import-fix-log.json');

// 파일별 import 변경 로그
const changeLog = {
  totalFiles: 0,
  totalImports: 0,
  changedImports: 0,
  errors: [],
  changes: []
};

// 폴더 이동 매핑 (restructure-folders.js와 동기화)
const FOLDER_MAPPINGS = {
  // Feature modules
  'features/projects': 'modules/projects',
  'features/factories': 'modules/factories',
  'features/users': 'modules/users',
  'features/schedule': 'modules/schedule',
  'features/product-development': 'modules/products',
  'features/common': 'shared',
  
  // Pages
  'pages/Projects': 'modules/projects/pages',
  'pages/Factories': 'modules/factories/pages',
  'pages/Users': 'modules/users/pages',
  'pages/Customers': 'modules/customers/pages',
  'pages/ProductTypes': 'modules/products/pages',
  'pages/Dashboard': 'modules/dashboard/pages',
  'pages/NotFound': 'misc/pages/NotFound',
  'pages/Maintenance': 'misc/pages/Maintenance',
  
  // Component mappings
  'components/ProjectModal': 'modules/projects/components/ProjectModal',
  'components/ProjectDetailsView': 'modules/projects/components/ProjectDetailsView',
  'components/Factories': 'modules/factories/components',
  'components/Users': 'modules/users/components',
  'components/Schedule': 'modules/schedule/components/Schedule',
  'components/GanttChart': 'modules/schedule/components/GanttChart',
  'components/Gantt': 'modules/schedule/components/Gantt',
  'components/CustomerModal': 'modules/customers/components/CustomerModal',
  'components/ProductRequestModal': 'modules/products/components/ProductRequestModal',
  'components/ProductTypes': 'modules/products/components/ProductTypes',
  'components/TaskCreateModal': 'modules/schedule/components/TaskCreateModal',
  'components/TaskViewWithSidebar': 'modules/schedule/components/TaskViewWithSidebar',
  'components/WorkflowModal': 'modules/schedule/components/WorkflowModal',
  'components/EmailModal': 'shared/components/EmailModal',
  'components/CommentSection': 'shared/components/CommentSection',
  
  // Shared components
  'components/common': 'shared/components/common',
  'components/ui': 'shared/components/ui',
  'components/forms': 'shared/components/forms',
  'components/Modal': 'shared/components/Modal',
  'components/ErrorBoundary': 'shared/components/ErrorBoundary',
  'components/loading': 'shared/components/loading',
  'components/VirtualList': 'shared/components/VirtualList',
  'components/OptimizedTable': 'shared/components/OptimizedTable',
  'components/GlobalErrorHandler': 'shared/components/GlobalErrorHandler',
  'components/providers': 'app/providers',
  'components/examples': 'misc/examples',
  
  // Design system
  'design-system/components': 'shared/components',
  'design-system/styles': 'shared/styles',
  'design-system/colors': 'shared/styles/colors',
  'design-system': 'shared/styles',
  
  // Core services
  'api': 'core/api',
  'services/api': 'core/api/services',
  'services/mockData': 'core/services/mockData',
  'services': 'core/services',
  'store': 'core/store',
  'stores': 'core/store',
  'store/slices': 'core/store/slices',
  'store/hooks': 'core/store/hooks',
  'stores/migration': 'core/store/migration',
  
  // Mocks
  'mocks/api': 'core/api/mocks',
  'mocks/services': 'core/services/mocks',
  'mocks/database': 'core/database',
  'mocks/data': 'core/database/data',
  'mocks/adapters': 'core/api/adapters',
  'data': 'core/database/data',
  
  // Shared resources
  'hooks': 'shared/hooks',
  'hooks/common': 'shared/hooks/common',
  'hooks/query': 'shared/hooks/query',
  'hooks/useProjects': 'modules/projects/hooks',
  'hooks/asyncState': 'shared/hooks/asyncState',
  'hooks/useLogging': 'shared/hooks/useLogging',
  
  'utils': 'shared/utils',
  'utils/api': 'shared/utils/api',
  'utils/common': 'shared/utils/common',
  'utils/customer': 'modules/customers/utils',
  'utils/date': 'shared/utils/date',
  'utils/error': 'shared/utils/error',
  'utils/gantt': 'modules/schedule/utils/gantt',
  'utils/schedule': 'modules/schedule/utils',
  'utils/logger': 'shared/utils/logger',
  'utils/performance': 'shared/utils/performance',
  'utils/security': 'shared/utils/security',
  'utils/store': 'core/store/utils',
  
  'types': 'shared/types',
  'types/api': 'shared/types/api',
  'types/enums': 'shared/types/enums',
  
  'constants': 'shared/constants',
  'validation': 'core/validation',
  'styles': 'shared/styles',
  
  // App level
  'router': 'app/router',
  'providers': 'app/providers',
  'contexts': 'app/providers',
  'context': 'app/providers',
  'layouts': 'app/layouts',
  'layouts/MainLayout': 'app/layouts/MainLayout',
  'config': 'app/config',
  
  // Assets
  'assets': 'assets',
  
  // Errors
  'errors': 'shared/utils/errors',
  
  // Tests
  '__tests__': 'tests',
  '__tests__/features': 'tests/features'
};

// 파일 이동 후 실제 경로 매핑 (런타임에 생성)
const actualPathMappings = new Map();

/**
 * 모든 TypeScript/JavaScript 파일 찾기
 */
async function getAllSourceFiles() {
  return new Promise((resolve, reject) => {
    glob(
      path.join(SRC_DIR, '**/*.{ts,tsx,js,jsx}'),
      { ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'] },
      (err, files) => {
        if (err) reject(err);
        else resolve(files);
      }
    );
  });
}

/**
 * 파일 내용에서 모든 import 구문 찾기
 */
function findAllImports(content) {
  const imports = [];
  
  // 1. ES6 import statements
  const es6ImportRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))?\s+from\s+)?['"]([^'"]+)['"]/g;
  
  // 2. Dynamic imports
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  
  // 3. Require statements
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  
  // 4. Export from statements
  const exportFromRegex = /export\s+(?:\{[^}]*\}|\*)?\s*from\s+['"]([^'"]+)['"]/g;
  
  // 5. Type imports (TypeScript)
  const typeImportRegex = /import\s+type\s+(?:\{[^}]*\}|\w+)\s+from\s+['"]([^'"]+)['"]/g;
  
  // Collect all imports
  const regexes = [
    { regex: es6ImportRegex, type: 'es6' },
    { regex: dynamicImportRegex, type: 'dynamic' },
    { regex: requireRegex, type: 'require' },
    { regex: exportFromRegex, type: 'export' },
    { regex: typeImportRegex, type: 'type' }
  ];
  
  for (const { regex, type } of regexes) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      imports.push({
        full: match[0],
        path: match[1],
        type,
        index: match.index
      });
    }
  }
  
  return imports;
}

/**
 * Import 경로 변환
 */
function transformImportPath(importPath, currentFilePath) {
  const currentDir = path.dirname(currentFilePath);
  
  // 외부 패키지나 Node 모듈은 건드리지 않음
  if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
    return null;
  }
  
  // @/ 절대 경로 처리
  if (importPath.startsWith('@/')) {
    const pathWithoutAlias = importPath.substring(3);
    
    // 정확한 매칭 먼저 시도
    for (const [oldPath, newPath] of Object.entries(FOLDER_MAPPINGS)) {
      if (pathWithoutAlias === oldPath || pathWithoutAlias.startsWith(oldPath + '/')) {
        const remainingPath = pathWithoutAlias.substring(oldPath.length);
        return '@/' + newPath + remainingPath;
      }
    }
    
    // 부분 매칭 시도
    const parts = pathWithoutAlias.split('/');
    let accumulated = '';
    for (let i = 0; i < parts.length; i++) {
      accumulated = parts.slice(0, i + 1).join('/');
      if (FOLDER_MAPPINGS[accumulated]) {
        const remaining = parts.slice(i + 1).join('/');
        const newBase = FOLDER_MAPPINGS[accumulated];
        return '@/' + (remaining ? newBase + '/' + remaining : newBase);
      }
    }
  }
  
  // 상대 경로 처리
  if (importPath.startsWith('.')) {
    // 상대 경로를 절대 경로로 변환
    let resolvedPath = path.resolve(currentDir, importPath);
    
    // 파일 확장자 처리
    const extensions = ['.ts', '.tsx', '.js', '.jsx', ''];
    let actualPath = resolvedPath;
    let isDirectory = false;
    
    for (const ext of extensions) {
      if (fs.existsSync(resolvedPath + ext)) {
        actualPath = resolvedPath + ext;
        break;
      }
      if (fs.existsSync(path.join(resolvedPath, 'index' + ext))) {
        actualPath = path.join(resolvedPath, 'index' + ext);
        isDirectory = true;
        break;
      }
    }
    
    // SRC_DIR 기준 상대 경로 계산
    const relativeToSrc = path.relative(SRC_DIR, actualPath);
    const pathWithoutExt = relativeToSrc.replace(/\.(ts|tsx|js|jsx)$/, '');
    const pathForMatching = isDirectory ? path.dirname(pathWithoutExt) : pathWithoutExt;
    
    // 매핑 확인
    for (const [oldPath, newPath] of Object.entries(FOLDER_MAPPINGS)) {
      if (pathForMatching === oldPath || pathForMatching.startsWith(oldPath + '/')) {
        const remainingPath = pathForMatching.substring(oldPath.length);
        const newFullPath = newPath + remainingPath;
        const newAbsolutePath = path.join(SRC_DIR, newFullPath);
        
        // 새로운 상대 경로 계산
        let newRelativePath = path.relative(currentDir, newAbsolutePath);
        if (!newRelativePath.startsWith('.')) {
          newRelativePath = './' + newRelativePath;
        }
        
        return newRelativePath;
      }
    }
  }
  
  return null;
}

/**
 * 파일 처리
 */
async function processFile(filePath) {
  try {
    changeLog.totalFiles++;
    
    const content = await fs.readFile(filePath, 'utf-8');
    const imports = findAllImports(content);
    let updatedContent = content;
    let offset = 0;
    let fileChanges = 0;
    
    changeLog.totalImports += imports.length;
    
    for (const importInfo of imports) {
      const newPath = transformImportPath(importInfo.path, filePath);
      
      if (newPath && newPath !== importInfo.path) {
        // Import 경로 교체
        const newImport = importInfo.full.replace(importInfo.path, newPath);
        const startIndex = importInfo.index + offset;
        const endIndex = startIndex + importInfo.full.length;
        
        updatedContent = 
          updatedContent.substring(0, startIndex) + 
          newImport + 
          updatedContent.substring(endIndex);
        
        offset += newImport.length - importInfo.full.length;
        fileChanges++;
        changeLog.changedImports++;
        
        // 로그 기록
        changeLog.changes.push({
          file: path.relative(SRC_DIR, filePath),
          type: importInfo.type,
          from: importInfo.path,
          to: newPath
        });
      }
    }
    
    if (fileChanges > 0) {
      await fs.writeFile(filePath, updatedContent);
      console.log(`  ✅ Updated ${fileChanges} imports in: ${path.relative(SRC_DIR, filePath)}`);
    }
    
    return fileChanges;
  } catch (error) {
    const errorMsg = `Error processing ${filePath}: ${error.message}`;
    console.error(`  ❌ ${errorMsg}`);
    changeLog.errors.push(errorMsg);
    return 0;
  }
}

/**
 * Import 정렬 및 그룹화
 */
function organizeImports(content) {
  const lines = content.split('\n');
  const imports = {
    react: [],
    external: [],
    absolute: [],
    relative: [],
    types: [],
    styles: []
  };
  
  let firstImportIndex = -1;
  let lastImportIndex = -1;
  
  lines.forEach((line, index) => {
    if (line.match(/^import\s+/)) {
      if (firstImportIndex === -1) firstImportIndex = index;
      lastImportIndex = index;
      
      if (line.includes('react')) {
        imports.react.push(line);
      } else if (line.includes('.css') || line.includes('.scss')) {
        imports.styles.push(line);
      } else if (line.includes('import type')) {
        imports.types.push(line);
      } else if (line.includes('@/')) {
        imports.absolute.push(line);
      } else if (line.match(/from\s+['"]\./)) {
        imports.relative.push(line);
      } else {
        imports.external.push(line);
      }
    }
  });
  
  if (firstImportIndex === -1) return content;
  
  // Import 재구성
  const organizedImports = [
    ...imports.react,
    ...(imports.react.length && imports.external.length ? [''] : []),
    ...imports.external,
    ...(imports.external.length && imports.absolute.length ? [''] : []),
    ...imports.absolute,
    ...(imports.absolute.length && imports.relative.length ? [''] : []),
    ...imports.relative,
    ...(imports.relative.length && imports.types.length ? [''] : []),
    ...imports.types,
    ...(imports.types.length && imports.styles.length ? [''] : []),
    ...imports.styles
  ];
  
  // 새로운 컨텐츠 생성
  const newLines = [
    ...lines.slice(0, firstImportIndex),
    ...organizedImports,
    ...lines.slice(lastImportIndex + 1)
  ];
  
  return newLines.join('\n');
}

/**
 * 순환 참조 검사
 */
async function checkCircularDependencies() {
  console.log('\n🔍 Checking for circular dependencies...');
  
  const dependencies = new Map();
  const files = await getAllSourceFiles();
  
  // 각 파일의 의존성 수집
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const imports = findAllImports(content);
    const deps = imports.map(imp => imp.path).filter(p => p.startsWith('@/') || p.startsWith('.'));
    dependencies.set(file, deps);
  }
  
  // 순환 참조 탐지
  function findCycles(node, visited = new Set(), path = []) {
    if (visited.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) {
        return [path.slice(cycleStart)];
      }
      return [];
    }
    
    visited.add(node);
    path.push(node);
    
    const cycles = [];
    const deps = dependencies.get(node) || [];
    
    for (const dep of deps) {
      // Resolve dependency path
      const resolvedDep = path.resolve(path.dirname(node), dep);
      if (dependencies.has(resolvedDep)) {
        cycles.push(...findCycles(resolvedDep, new Set(visited), [...path]));
      }
    }
    
    return cycles;
  }
  
  const allCycles = new Set();
  for (const file of files) {
    const cycles = findCycles(file);
    cycles.forEach(cycle => allCycles.add(JSON.stringify(cycle)));
  }
  
  if (allCycles.size > 0) {
    console.log(`  ⚠️  Found ${allCycles.size} circular dependencies`);
    changeLog.circularDependencies = Array.from(allCycles).map(c => JSON.parse(c));
  } else {
    console.log('  ✅ No circular dependencies found');
  }
}

/**
 * tsconfig.json 업데이트
 */
async function updateTsConfig() {
  console.log('\n⚙️  Updating tsconfig.json...');
  
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  
  if (!await fs.pathExists(tsconfigPath)) {
    console.log('  ⚠️  tsconfig.json not found');
    return;
  }
  
  const tsconfig = await fs.readJSON(tsconfigPath);
  
  // Path mappings 업데이트
  tsconfig.compilerOptions = tsconfig.compilerOptions || {};
  tsconfig.compilerOptions.paths = {
    "@/*": ["./src/*"],
    "@/app/*": ["./src/app/*"],
    "@/modules/*": ["./src/modules/*"],
    "@/shared/*": ["./src/shared/*"],
    "@/core/*": ["./src/core/*"],
    "@/assets/*": ["./src/assets/*"],
    "@/tests/*": ["./src/tests/*"],
    "@/misc/*": ["./src/misc/*"]
  };
  
  await fs.writeJSON(tsconfigPath, tsconfig, { spaces: 2 });
  console.log('  ✅ Updated tsconfig.json');
}

/**
 * 로그 저장
 */
async function saveLog() {
  await fs.writeJSON(LOG_FILE, changeLog, { spaces: 2 });
  console.log(`\n📋 Detailed log saved to: ${LOG_FILE}`);
}

/**
 * 메인 함수
 */
async function main() {
  try {
    console.log('🚀 Starting comprehensive import path fixes...\n');
    
    // 1. 모든 소스 파일 찾기
    const files = await getAllSourceFiles();
    console.log(`📁 Found ${files.length} source files\n`);
    
    // 2. 각 파일 처리
    console.log('📝 Processing files...');
    for (const file of files) {
      await processFile(file);
    }
    
    // 3. Import 정렬 (선택적)
    if (process.argv.includes('--organize')) {
      console.log('\n📚 Organizing imports...');
      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        const organized = organizeImports(content);
        if (organized !== content) {
          await fs.writeFile(file, organized);
          console.log(`  ✅ Organized imports in: ${path.relative(SRC_DIR, file)}`);
        }
      }
    }
    
    // 4. 순환 참조 검사
    await checkCircularDependencies();
    
    // 5. tsconfig 업데이트
    await updateTsConfig();
    
    // 6. 로그 저장
    await saveLog();
    
    // 7. 결과 출력
    console.log('\n✨ Import path fixes completed!');
    console.log('📊 Summary:');
    console.log(`  - Total files processed: ${changeLog.totalFiles}`);
    console.log(`  - Total imports found: ${changeLog.totalImports}`);
    console.log(`  - Imports updated: ${changeLog.changedImports}`);
    if (changeLog.errors.length > 0) {
      console.log(`  - Errors: ${changeLog.errors.length}`);
    }
    
    if (changeLog.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      changeLog.errors.forEach(err => console.log(`  - ${err}`));
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  main();
}

module.exports = { FOLDER_MAPPINGS, transformImportPath };