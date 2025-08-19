#!/usr/bin/env node

/**
 * Ultimate Code Quality Check Script for FLAT Dashboard
 * 
 * Comprehensive analysis tool that checks:
 * - Single Responsibility Principle (SRP) violations
 * - Circular dependencies
 * - File size and complexity
 * - Code organization and separation of concerns
 * - Import patterns and dependencies
 * - Naming conventions and standards
 * - Performance and optimization issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  maxFileLines: 300,           // Maximum lines per file
  maxFunctionLines: 50,        // Maximum lines per function
  maxComplexity: 10,           // Maximum cyclomatic complexity
  maxImports: 15,              // Maximum imports per file
  maxExports: 10,              // Maximum exports per file (for SRP)
  maxComponentProps: 8,        // Maximum props for a component
  maxDependencyDepth: 3,       // Maximum depth for relative imports (../../..)
  minTestCoverage: 80,         // Minimum test coverage percentage
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m'
};

// Score tracking
const scoreSystem = {
  critical: [],    // Must fix
  major: [],       // Should fix
  minor: [],       // Nice to fix
  passed: [],      // All good
  stats: {}        // Statistics
};

// Helper functions
function log(message, color = 'reset', prefix = '') {
  const timestamp = new Date().toTimeString().slice(0, 8);
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${prefix}${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '═'.repeat(60));
  log(` ${title} `, 'bright');
  console.log('═'.repeat(60));
}

function getFileStats(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  return {
    totalLines: lines.length,
    codeLines: lines.filter(l => l.trim() && !l.trim().startsWith('//')).length,
    imports: (content.match(/^import .*/gm) || []).length,
    exports: (content.match(/^export .*/gm) || []).length,
    functions: (content.match(/function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g) || []).length,
    classes: (content.match(/class\s+\w+/g) || []).length,
    interfaces: (content.match(/interface\s+\w+/g) || []).length,
    types: (content.match(/type\s+\w+\s*=/g) || []).length,
    content
  };
}

// ═══════════════════════════════════════════════════════════════
// 1. SINGLE RESPONSIBILITY PRINCIPLE (SRP) CHECK
// ═══════════════════════════════════════════════════════════════

function checkSRP() {
  logSection('🎯 Single Responsibility Principle (SRP) Analysis');
  
  const srcPath = path.join(__dirname, '..', 'flat', 'src');
  const violations = [];
  
  function analyzeFile(filePath) {
    const relativePath = path.relative(srcPath, filePath);
    const stats = getFileStats(filePath);
    const fileName = path.basename(filePath);
    const issues = [];
    
    // Check 1: Too many exports (multiple responsibilities)
    if (stats.exports > CONFIG.maxExports) {
      issues.push(`Too many exports (${stats.exports}/${CONFIG.maxExports})`);
    }
    
    // Check 2: Mixed concerns (e.g., component + utils + types in same file)
    const hasComponent = /export.*function.*[A-Z]\w*|export.*const.*[A-Z]\w*.*=.*\(|<.*>/.test(stats.content);
    const hasUtils = /export.*function.*[a-z]\w*|export.*const.*[a-z]\w*.*=/.test(stats.content);
    const hasTypes = stats.interfaces > 0 || stats.types > 0;
    const hasHooks = /export.*use[A-Z]\w*/.test(stats.content);
    
    const concerns = [hasComponent, hasUtils, hasTypes, hasHooks].filter(Boolean).length;
    if (concerns > 2) {
      issues.push('Mixed concerns in single file');
    }
    
    // Check 3: File doing too much (size + complexity)
    if (stats.totalLines > CONFIG.maxFileLines && stats.functions > 5) {
      issues.push(`File too large with many functions (${stats.totalLines} lines, ${stats.functions} functions)`);
    }
    
    // Check 4: God object/component (too many methods/props)
    if (fileName.endsWith('.tsx')) {
      const propsMatch = stats.content.match(/interface\s+\w*Props\s*{([^}]*)}/s);
      if (propsMatch) {
        const propsCount = (propsMatch[1].match(/^\s*\w+[?]?:/gm) || []).length;
        if (propsCount > CONFIG.maxComponentProps) {
          issues.push(`Component has too many props (${propsCount}/${CONFIG.maxComponentProps})`);
        }
      }
    }
    
    // Check 5: Multiple unrelated functions
    const functionNames = (stats.content.match(/(?:function|const)\s+(\w+)/g) || [])
      .map(f => f.replace(/function|const/g, '').trim());
    
    if (functionNames.length > 10) {
      // Check if functions have common prefix (related)
      const prefixes = functionNames.map(n => n.slice(0, 3));
      const uniquePrefixes = new Set(prefixes).size;
      
      if (uniquePrefixes > functionNames.length * 0.7) {
        issues.push(`Many unrelated functions (${functionNames.length} functions with ${uniquePrefixes} different prefixes)`);
      }
    }
    
    if (issues.length > 0) {
      violations.push({ file: relativePath, issues, stats });
    }
  }
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath);
      } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.includes('.test.')) {
        analyzeFile(filePath);
      }
    }
  }
  
  walkDir(srcPath);
  
  // Report results
  if (violations.length === 0) {
    log('✅ All files follow Single Responsibility Principle', 'green');
    scoreSystem.passed.push('SRP Compliance');
  } else {
    const critical = violations.filter(v => v.issues.length >= 3);
    const major = violations.filter(v => v.issues.length === 2);
    const minor = violations.filter(v => v.issues.length === 1);
    
    if (critical.length > 0) {
      log(`❌ ${critical.length} files severely violate SRP`, 'red');
      scoreSystem.critical.push(`SRP Violations (${critical.length} critical)`);
      
      critical.slice(0, 3).forEach(v => {
        log(`  📁 ${v.file}`, 'yellow');
        v.issues.forEach(issue => log(`     • ${issue}`, 'dim'));
      });
    }
    
    if (major.length > 0) {
      log(`⚠️  ${major.length} files have major SRP issues`, 'yellow');
      scoreSystem.major.push(`SRP Issues (${major.length} major)`);
    }
    
    if (minor.length > 0) {
      log(`ℹ️  ${minor.length} files have minor SRP issues`, 'blue');
      scoreSystem.minor.push(`SRP Issues (${minor.length} minor)`);
    }
  }
  
  scoreSystem.stats.srpViolations = violations.length;
}

// ═══════════════════════════════════════════════════════════════
// 2. CIRCULAR DEPENDENCY CHECK
// ═══════════════════════════════════════════════════════════════

function checkCircularDependencies() {
  logSection('🔄 Circular Dependency Analysis');
  
  const srcPath = path.join(__dirname, '..', 'flat', 'src');
  const dependencies = new Map();
  const visited = new Set();
  const circles = [];
  
  // Build dependency graph
  function extractImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(srcPath, filePath);
    const imports = [];
    
    // Match all import statements
    const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Only process relative imports within the project
      if (importPath.startsWith('.')) {
        const resolvedPath = path.resolve(path.dirname(filePath), importPath);
        const normalizedPath = path.relative(srcPath, resolvedPath)
          .replace(/\\/g, '/')
          .replace(/\.(ts|tsx|js|jsx)$/, '');
        
        // Handle index imports
        if (fs.existsSync(path.join(srcPath, normalizedPath + '.ts')) ||
            fs.existsSync(path.join(srcPath, normalizedPath + '.tsx'))) {
          imports.push(normalizedPath);
        } else if (fs.existsSync(path.join(srcPath, normalizedPath, 'index.ts')) ||
                   fs.existsSync(path.join(srcPath, normalizedPath, 'index.tsx'))) {
          imports.push(normalizedPath + '/index');
        }
      }
    }
    
    dependencies.set(relativePath.replace(/\\/g, '/').replace(/\.(ts|tsx)$/, ''), imports);
  }
  
  // DFS to find cycles
  function findCycles(node, path = [], visiting = new Set()) {
    if (visiting.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) {
        const cycle = path.slice(cycleStart).concat(node);
        circles.push(cycle);
        return;
      }
    }
    
    if (visited.has(node)) return;
    
    visiting.add(node);
    path.push(node);
    
    const deps = dependencies.get(node) || [];
    for (const dep of deps) {
      findCycles(dep, [...path], new Set(visiting));
    }
    
    visiting.delete(node);
    visited.add(node);
  }
  
  // Build dependency graph
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        extractImports(filePath);
      }
    }
  }
  
  walkDir(srcPath);
  
  // Find all cycles
  for (const [file] of dependencies) {
    if (!visited.has(file)) {
      findCycles(file);
    }
  }
  
  // Remove duplicate cycles
  const uniqueCycles = Array.from(new Set(circles.map(c => c.sort().join(' -> '))));
  
  // Report results
  if (uniqueCycles.length === 0) {
    log('✅ No circular dependencies detected', 'green');
    scoreSystem.passed.push('No Circular Dependencies');
  } else {
    log(`❌ ${uniqueCycles.length} circular dependencies found!`, 'red');
    scoreSystem.critical.push(`Circular Dependencies (${uniqueCycles.length})`);
    
    uniqueCycles.slice(0, 3).forEach((cycle, i) => {
      log(`\n  Cycle ${i + 1}:`, 'yellow');
      cycle.split(' -> ').forEach((file, j) => {
        const prefix = j === 0 ? '  🔄 ' : '  ↳  ';
        log(`${prefix}${file}`, 'dim');
      });
    });
  }
  
  scoreSystem.stats.circularDeps = uniqueCycles.length;
}

// ═══════════════════════════════════════════════════════════════
// 3. FILE SIZE AND COMPLEXITY CHECK
// ═══════════════════════════════════════════════════════════════

function checkFileSizeAndComplexity() {
  logSection('📏 File Size and Complexity Analysis');
  
  const srcPath = path.join(__dirname, '..', 'flat', 'src');
  const issues = {
    tooLarge: [],
    tooComplex: [],
    tooManyImports: [],
    deepNesting: []
  };
  
  function analyzeComplexity(content) {
    // Simplified cyclomatic complexity calculation
    const conditionals = (content.match(/if\s*\(|else\s+if|else\s*{|\?\s*:|switch\s*\(|case\s+|catch\s*\(/g) || []).length;
    const loops = (content.match(/for\s*\(|while\s*\(|do\s*{|\.map\(|\.filter\(|\.reduce\(/g) || []).length;
    const logicalOps = (content.match(/&&|\|\|/g) || []).length;
    
    return conditionals + loops + Math.floor(logicalOps / 2);
  }
  
  function analyzeNesting(content) {
    let maxNesting = 0;
    let currentNesting = 0;
    
    for (const char of content) {
      if (char === '{') {
        currentNesting++;
        maxNesting = Math.max(maxNesting, currentNesting);
      } else if (char === '}') {
        currentNesting--;
      }
    }
    
    return maxNesting;
  }
  
  function checkFile(filePath) {
    const relativePath = path.relative(srcPath, filePath);
    const stats = getFileStats(filePath);
    
    // Check file size
    if (stats.totalLines > CONFIG.maxFileLines) {
      issues.tooLarge.push({
        file: relativePath,
        lines: stats.totalLines,
        severity: stats.totalLines > CONFIG.maxFileLines * 1.5 ? 'critical' : 'major'
      });
    }
    
    // Check complexity
    const complexity = analyzeComplexity(stats.content);
    if (complexity > CONFIG.maxComplexity) {
      issues.tooComplex.push({
        file: relativePath,
        complexity,
        severity: complexity > CONFIG.maxComplexity * 1.5 ? 'critical' : 'major'
      });
    }
    
    // Check imports
    if (stats.imports > CONFIG.maxImports) {
      issues.tooManyImports.push({
        file: relativePath,
        imports: stats.imports,
        severity: stats.imports > CONFIG.maxImports * 1.5 ? 'major' : 'minor'
      });
    }
    
    // Check nesting depth
    const nesting = analyzeNesting(stats.content);
    if (nesting > 6) {
      issues.deepNesting.push({
        file: relativePath,
        depth: nesting,
        severity: nesting > 8 ? 'major' : 'minor'
      });
    }
  }
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath);
      } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.includes('.test.')) {
        checkFile(filePath);
      }
    }
  }
  
  walkDir(srcPath);
  
  // Report results
  let hasIssues = false;
  
  if (issues.tooLarge.length > 0) {
    const critical = issues.tooLarge.filter(i => i.severity === 'critical');
    const major = issues.tooLarge.filter(i => i.severity === 'major');
    
    if (critical.length > 0) {
      log(`❌ ${critical.length} files are critically large (>${CONFIG.maxFileLines * 1.5} lines)`, 'red');
      scoreSystem.critical.push(`Large Files (${critical.length} critical)`);
      
      critical.slice(0, 3).forEach(f => {
        log(`  📁 ${f.file}: ${f.lines} lines`, 'yellow');
      });
    }
    
    if (major.length > 0) {
      log(`⚠️  ${major.length} files are too large (>${CONFIG.maxFileLines} lines)`, 'yellow');
      scoreSystem.major.push(`Large Files (${major.length})`);
    }
    
    hasIssues = true;
  }
  
  if (issues.tooComplex.length > 0) {
    log(`⚠️  ${issues.tooComplex.length} files have high complexity`, 'yellow');
    scoreSystem.major.push(`Complex Files (${issues.tooComplex.length})`);
    
    issues.tooComplex.slice(0, 3).forEach(f => {
      log(`  📁 ${f.file}: complexity ${f.complexity}`, 'dim');
    });
    
    hasIssues = true;
  }
  
  if (issues.tooManyImports.length > 0) {
    log(`ℹ️  ${issues.tooManyImports.length} files have many imports`, 'blue');
    scoreSystem.minor.push(`Many Imports (${issues.tooManyImports.length})`);
    hasIssues = true;
  }
  
  if (!hasIssues) {
    log('✅ All files have appropriate size and complexity', 'green');
    scoreSystem.passed.push('File Size & Complexity');
  }
  
  scoreSystem.stats.largeFiles = issues.tooLarge.length;
  scoreSystem.stats.complexFiles = issues.tooComplex.length;
}

// ═══════════════════════════════════════════════════════════════
// 4. CODE ORGANIZATION CHECK
// ═══════════════════════════════════════════════════════════════

function checkCodeOrganization() {
  logSection('📁 Code Organization and Structure');
  
  const srcPath = path.join(__dirname, '..', 'flat', 'src');
  const issues = [];
  
  // Check for proper file organization
  function checkStructure() {
    const expectedDirs = ['components', 'hooks', 'types', 'utils', 'services'];
    const actualDirs = fs.readdirSync(srcPath)
      .filter(f => fs.statSync(path.join(srcPath, f)).isDirectory());
    
    // Check for missing standard directories
    const missingDirs = expectedDirs.filter(d => !actualDirs.includes(d));
    if (missingDirs.length > 0) {
      issues.push(`Missing standard directories: ${missingDirs.join(', ')}`);
    }
    
    // Check for files in wrong places
    const rootFiles = fs.readdirSync(srcPath)
      .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
      .filter(f => !['index.ts', 'index.tsx', 'App.tsx', 'main.tsx'].includes(f));
    
    if (rootFiles.length > 0) {
      issues.push(`${rootFiles.length} TypeScript files in root (should be in subdirectories)`);
    }
  }
  
  // Check for barrel exports
  function checkBarrelExports() {
    const dirs = ['components', 'hooks', 'utils', 'types', 'services'];
    const missingBarrels = [];
    
    for (const dir of dirs) {
      const dirPath = path.join(srcPath, dir);
      if (fs.existsSync(dirPath)) {
        const indexPath = path.join(dirPath, 'index.ts');
        const indexTsxPath = path.join(dirPath, 'index.tsx');
        
        if (!fs.existsSync(indexPath) && !fs.existsSync(indexTsxPath)) {
          missingBarrels.push(dir);
        }
      }
    }
    
    if (missingBarrels.length > 0) {
      issues.push(`Missing barrel exports (index.ts) in: ${missingBarrels.join(', ')}`);
    }
  }
  
  // Check import patterns
  function checkImportPatterns() {
    let deepImports = 0;
    let absoluteImports = 0;
    let relativeImports = 0;
    
    function checkFile(filePath) {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = content.match(/from\s+['"](.*?)['"]/g) || [];
      
      for (const imp of imports) {
        const match = imp.match(/['"](.*)['"]/)
        if (!match) continue;
        const importPath = match[1];
        
        if (importPath.startsWith('@/')) {
          absoluteImports++;
        } else if (importPath.startsWith('.')) {
          relativeImports++;
          
          // Count depth
          const depth = (importPath.match(/\.\.\//g) || []).length;
          if (depth >= CONFIG.maxDependencyDepth) {
            deepImports++;
          }
        }
      }
    }
    
    function walkDir(dir) {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          walkDir(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          checkFile(filePath);
        }
      }
    }
    
    walkDir(srcPath);
    
    if (deepImports > 0) {
      issues.push(`${deepImports} deep relative imports (../../..) found`);
    }
    
    const totalImports = absoluteImports + relativeImports;
    const absoluteRatio = (absoluteImports / totalImports * 100).toFixed(1);
    
    if (absoluteRatio < 50) {
      issues.push(`Low absolute import usage (${absoluteRatio}% - should be >50%)`);
    }
    
    scoreSystem.stats.importRatio = absoluteRatio;
  }
  
  checkStructure();
  checkBarrelExports();
  checkImportPatterns();
  
  // Report results
  if (issues.length === 0) {
    log('✅ Code is well organized', 'green');
    scoreSystem.passed.push('Code Organization');
  } else {
    log(`⚠️  ${issues.length} organization issues found`, 'yellow');
    scoreSystem.major.push(`Organization Issues (${issues.length})`);
    
    issues.forEach(issue => {
      log(`  • ${issue}`, 'dim');
    });
  }
  
  scoreSystem.stats.organizationIssues = issues.length;
}

// ═══════════════════════════════════════════════════════════════
// 5. PERFORMANCE AND OPTIMIZATION CHECK
// ═══════════════════════════════════════════════════════════════

function checkPerformance() {
  logSection('⚡ Performance and Optimization');
  
  const srcPath = path.join(__dirname, '..', 'flat', 'src');
  const issues = {
    largeComponents: [],
    missingMemo: [],
    inlineCallbacks: [],
    largeArrayOperations: []
  };
  
  function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(srcPath, filePath);
    const fileName = path.basename(filePath);
    
    // Check for React performance issues
    if (fileName.endsWith('.tsx')) {
      // Check for missing React.memo
      const hasUseEffect = /useEffect|useCallback|useMemo/.test(content);
      const hasMemo = /React\.memo|memo\(/.test(content);
      const isComponent = /export.*function.*[A-Z]|export.*const.*[A-Z].*=.*=>/.test(content);
      
      if (isComponent && hasUseEffect && !hasMemo) {
        issues.missingMemo.push(relativePath);
      }
      
      // Check for inline callbacks in render
      const inlineCallbacks = content.match(/onClick=\{(?!handle|\w+Handle)[^}]*=>/g) || [];
      if (inlineCallbacks.length > 0) {
        issues.inlineCallbacks.push({
          file: relativePath,
          count: inlineCallbacks.length
        });
      }
    }
    
    // Check for large array operations without optimization
    const arrayOps = (content.match(/\.(map|filter|reduce|find|forEach)\(/g) || []).length;
    if (arrayOps > 10) {
      issues.largeArrayOperations.push({
        file: relativePath,
        operations: arrayOps
      });
    }
  }
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath);
      } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.includes('.test.')) {
        checkFile(filePath);
      }
    }
  }
  
  walkDir(srcPath);
  
  // Report results
  let hasIssues = false;
  
  if (issues.missingMemo.length > 0) {
    log(`⚠️  ${issues.missingMemo.length} components might benefit from React.memo`, 'yellow');
    scoreSystem.minor.push(`Missing React.memo (${issues.missingMemo.length})`);
    hasIssues = true;
  }
  
  if (issues.inlineCallbacks.length > 0) {
    log(`⚠️  ${issues.inlineCallbacks.length} files have inline callbacks`, 'yellow');
    scoreSystem.minor.push(`Inline Callbacks (${issues.inlineCallbacks.length})`);
    hasIssues = true;
  }
  
  if (issues.largeArrayOperations.length > 0) {
    log(`ℹ️  ${issues.largeArrayOperations.length} files have many array operations`, 'blue');
    scoreSystem.minor.push(`Array Operations (${issues.largeArrayOperations.length})`);
    hasIssues = true;
  }
  
  if (!hasIssues) {
    log('✅ No major performance issues detected', 'green');
    scoreSystem.passed.push('Performance');
  }
  
  scoreSystem.stats.performanceIssues = 
    issues.missingMemo.length + issues.inlineCallbacks.length;
}

// ═══════════════════════════════════════════════════════════════
// 6. NAMING CONVENTIONS CHECK
// ═══════════════════════════════════════════════════════════════

function checkNamingConventions() {
  logSection('📝 Naming Conventions');
  
  const srcPath = path.join(__dirname, '..', 'flat', 'src');
  const issues = [];
  
  function checkFile(filePath, fileName) {
    const relativePath = path.relative(srcPath, filePath);
    
    // Component files should be PascalCase
    if (filePath.includes('/components/') && fileName.endsWith('.tsx')) {
      if (fileName !== 'index.tsx' && !/^[A-Z]/.test(fileName)) {
        issues.push({
          file: relativePath,
          issue: 'Component file should start with uppercase',
          severity: 'major'
        });
      }
    }
    
    // Hook files should start with 'use'
    if (filePath.includes('/hooks/') && fileName.endsWith('.ts')) {
      if (!fileName.startsWith('use') && fileName !== 'index.ts') {
        issues.push({
          file: relativePath,
          issue: 'Hook file should start with "use"',
          severity: 'major'
        });
      }
    }
    
    // Utility files should be camelCase
    if (filePath.includes('/utils/') && fileName.endsWith('.ts')) {
      if (fileName !== 'index.ts' && /^[A-Z]/.test(fileName[0])) {
        issues.push({
          file: relativePath,
          issue: 'Utility file should start with lowercase',
          severity: 'minor'
        });
      }
    }
    
    // Type files should be singular and PascalCase
    if (filePath.includes('/types/') && fileName.endsWith('.ts')) {
      if (fileName !== 'index.ts' && !/^[A-Z]/.test(fileName) && !fileName.startsWith('types.')) {
        issues.push({
          file: relativePath,
          issue: 'Type file should be PascalCase',
          severity: 'minor'
        });
      }
    }
    
    // Check for snake_case or kebab-case in TypeScript files
    if (fileName.includes('_') || (fileName.includes('-') && !fileName.includes('.test'))) {
      issues.push({
        file: relativePath,
        issue: 'Use camelCase or PascalCase for file names',
        severity: 'minor'
      });
    }
  }
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        checkFile(filePath, file);
      }
    }
  }
  
  walkDir(srcPath);
  
  // Report results
  if (issues.length === 0) {
    log('✅ All files follow naming conventions', 'green');
    scoreSystem.passed.push('Naming Conventions');
  } else {
    const major = issues.filter(i => i.severity === 'major');
    const minor = issues.filter(i => i.severity === 'minor');
    
    if (major.length > 0) {
      log(`⚠️  ${major.length} major naming convention violations`, 'yellow');
      scoreSystem.major.push(`Naming Issues (${major.length})`);
      
      major.slice(0, 3).forEach(i => {
        log(`  • ${i.file}: ${i.issue}`, 'dim');
      });
    }
    
    if (minor.length > 0) {
      log(`ℹ️  ${minor.length} minor naming convention issues`, 'blue');
      scoreSystem.minor.push(`Naming Issues (${minor.length} minor)`);
    }
  }
  
  scoreSystem.stats.namingIssues = issues.length;
}

// ═══════════════════════════════════════════════════════════════
// 7. COMPREHENSIVE TYPE SAFETY CHECK
// ═══════════════════════════════════════════════════════════════

function checkTypeSafety() {
  logSection('🛡️ Type Safety Analysis');
  
  const srcPath = path.join(__dirname, '..', 'flat', 'src');
  const issues = {
    anyTypes: [],
    missingTypes: [],
    assertionAbuse: []
  };
  
  function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(srcPath, filePath);
    
    // Check for 'any' types
    const anyMatches = content.match(/:\s*any(?:\s|;|,|\)|\])/g) || [];
    if (anyMatches.length > 0) {
      issues.anyTypes.push({
        file: relativePath,
        count: anyMatches.length
      });
    }
    
    // Check for missing return types
    const functions = content.match(/(?:export\s+)?(?:async\s+)?function\s+\w+\([^)]*\)(?:\s*{)?/g) || [];
    const arrowFuncs = content.match(/(?:export\s+)?const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g) || [];
    
    let missingReturnTypes = 0;
    [...functions, ...arrowFuncs].forEach(func => {
      if (!func.includes(':') && !func.includes('function use')) { // Hooks often infer return type
        missingReturnTypes++;
      }
    });
    
    if (missingReturnTypes > 0) {
      issues.missingTypes.push({
        file: relativePath,
        count: missingReturnTypes
      });
    }
    
    // Check for type assertion abuse
    const assertions = content.match(/as\s+\w+/g) || [];
    if (assertions.length > 5) {
      issues.assertionAbuse.push({
        file: relativePath,
        count: assertions.length
      });
    }
  }
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath);
      } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.includes('.test.')) {
        checkFile(filePath);
      }
    }
  }
  
  walkDir(srcPath);
  
  // Report results
  let hasIssues = false;
  
  if (issues.anyTypes.length > 0) {
    const totalAny = issues.anyTypes.reduce((sum, i) => sum + i.count, 0);
    log(`⚠️  ${totalAny} uses of 'any' type in ${issues.anyTypes.length} files`, 'yellow');
    scoreSystem.major.push(`'any' Types (${totalAny})`);
    hasIssues = true;
  }
  
  if (issues.missingTypes.length > 0) {
    const totalMissing = issues.missingTypes.reduce((sum, i) => sum + i.count, 0);
    log(`ℹ️  ${totalMissing} missing type annotations in ${issues.missingTypes.length} files`, 'blue');
    scoreSystem.minor.push(`Missing Types (${totalMissing})`);
    hasIssues = true;
  }
  
  if (issues.assertionAbuse.length > 0) {
    log(`ℹ️  ${issues.assertionAbuse.length} files have many type assertions`, 'blue');
    scoreSystem.minor.push(`Type Assertions (${issues.assertionAbuse.length})`);
    hasIssues = true;
  }
  
  if (!hasIssues) {
    log('✅ Excellent type safety', 'green');
    scoreSystem.passed.push('Type Safety');
  }
  
  scoreSystem.stats.typeSafetyScore = 
    100 - (issues.anyTypes.length * 5 + issues.missingTypes.length * 2);
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXECUTION AND REPORTING
// ═══════════════════════════════════════════════════════════════

function generateReport() {
  console.log('\n' + '═'.repeat(60));
  log(' 📊 ULTIMATE CODE QUALITY REPORT ', 'bright');
  console.log('═'.repeat(60));
  
  // Calculate overall score
  const totalChecks = 
    scoreSystem.passed.length + 
    scoreSystem.critical.length + 
    scoreSystem.major.length + 
    scoreSystem.minor.length;
  
  const weightedScore = 
    (scoreSystem.passed.length * 100) +
    (scoreSystem.minor.length * 70) +
    (scoreSystem.major.length * 30) +
    (scoreSystem.critical.length * 0);
  
  const overallScore = Math.round(weightedScore / totalChecks);
  
  // Determine grade
  let grade, gradeColor;
  if (overallScore >= 90) { grade = 'A+'; gradeColor = 'green'; }
  else if (overallScore >= 85) { grade = 'A'; gradeColor = 'green'; }
  else if (overallScore >= 80) { grade = 'B+'; gradeColor = 'green'; }
  else if (overallScore >= 75) { grade = 'B'; gradeColor = 'yellow'; }
  else if (overallScore >= 70) { grade = 'C+'; gradeColor = 'yellow'; }
  else if (overallScore >= 65) { grade = 'C'; gradeColor = 'yellow'; }
  else { grade = 'D'; gradeColor = 'red'; }
  
  // Display results
  console.log('\n' + '─'.repeat(60));
  log('RESULTS SUMMARY', 'bright');
  console.log('─'.repeat(60));
  
  if (scoreSystem.critical.length > 0) {
    log('\n🚨 CRITICAL ISSUES (Must Fix):', 'red');
    scoreSystem.critical.forEach(issue => log(`   ✗ ${issue}`, 'red'));
  }
  
  if (scoreSystem.major.length > 0) {
    log('\n⚠️  MAJOR ISSUES (Should Fix):', 'yellow');
    scoreSystem.major.forEach(issue => log(`   ! ${issue}`, 'yellow'));
  }
  
  if (scoreSystem.minor.length > 0) {
    log('\nℹ️  MINOR ISSUES (Nice to Fix):', 'blue');
    scoreSystem.minor.forEach(issue => log(`   • ${issue}`, 'blue'));
  }
  
  if (scoreSystem.passed.length > 0) {
    log('\n✅ PASSED CHECKS:', 'green');
    scoreSystem.passed.forEach(check => log(`   ✓ ${check}`, 'green'));
  }
  
  // Statistics
  console.log('\n' + '─'.repeat(60));
  log('STATISTICS', 'bright');
  console.log('─'.repeat(60));
  
  Object.entries(scoreSystem.stats).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    log(`  ${label}: ${value}`, 'dim');
  });
  
  // Final score
  console.log('\n' + '═'.repeat(60));
  log(` OVERALL SCORE: ${overallScore}/100 (${grade})`, gradeColor);
  console.log('═'.repeat(60));
  
  // Recommendations
  if (scoreSystem.critical.length > 0) {
    console.log('\n' + colors.bgRed + colors.white + ' ACTION REQUIRED ' + colors.reset);
    log('Fix critical issues before deployment!', 'red');
  } else if (scoreSystem.major.length > 3) {
    console.log('\n' + colors.bgYellow + colors.white + ' ATTENTION NEEDED ' + colors.reset);
    log('Several major issues should be addressed soon.', 'yellow');
  } else if (overallScore >= 85) {
    console.log('\n' + colors.bgGreen + colors.white + ' EXCELLENT WORK! ' + colors.reset);
    log('Code quality is high. Keep it up!', 'green');
  }
  
  // Exit code
  if (scoreSystem.critical.length > 0) {
    process.exit(1);
  }
}

// Main execution
function main() {
  const startTime = Date.now();
  
  console.clear();
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(10) + colors.bright + 'FLAT DASHBOARD - ULTIMATE CODE CHECK' + colors.reset + ' '.repeat(11) + '║');
  console.log('║' + ' '.repeat(13) + colors.dim + 'Comprehensive Quality Analysis' + colors.reset + ' '.repeat(14) + '║');
  console.log('╚' + '═'.repeat(58) + '╝\n');
  
  // Run all checks
  checkSRP();
  checkCircularDependencies();
  checkFileSizeAndComplexity();
  checkCodeOrganization();
  checkPerformance();
  checkNamingConventions();
  checkTypeSafety();
  
  // Generate report
  generateReport();
  
  // Execution time
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n' + colors.dim + `Analysis completed in ${duration}s` + colors.reset);
}

// Run the ultimate check
main();