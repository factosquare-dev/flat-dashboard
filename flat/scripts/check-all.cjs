#!/usr/bin/env node

/**
 * Comprehensive Code Quality Check Script
 * Runs all important checks to ensure code quality and consistency
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to print colored output
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to run command and capture output
function runCommand(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Check results storage
const results = {
  passed: [],
  warnings: [],
  errors: []
};

// 1. Check for circular dependencies
function checkCircularDependencies() {
  log('\n📊 Checking for circular dependencies...', 'cyan');
  
  const result = runCommand('node scripts/detect-circular-dependencies.js', true);
  
  if (result.success && !result.output.includes('Circular dependency detected')) {
    log('✅ No circular dependencies found', 'green');
    results.passed.push('Circular Dependencies');
  } else {
    log('❌ Circular dependencies detected!', 'red');
    results.errors.push('Circular Dependencies');
    
    // Run the script again to show details
    runCommand('node scripts/detect-circular-dependencies.js');
  }
}

// 2. Check for duplicate code
function checkDuplicates() {
  log('\n📊 Checking for duplicate code...', 'cyan');
  
  const result = runCommand('node scripts/find-duplicates.js', true);
  
  if (result.success) {
    const output = result.output;
    const duplicateCount = (output.match(/Duplicate files found:/g) || []).length;
    
    if (duplicateCount === 0) {
      log('✅ No duplicate code found', 'green');
      results.passed.push('Duplicate Code');
    } else {
      log(`⚠️  ${duplicateCount} duplicate files found`, 'yellow');
      results.warnings.push(`Duplicate Code (${duplicateCount} files)`);
    }
  }
}

// 3. Check for relative imports
function checkRelativeImports() {
  log('\n📊 Checking for deep relative imports...', 'cyan');
  
  const srcPath = path.join(__dirname, '..', 'flat', 'src');
  let deepImportCount = 0;
  const problematicFiles = [];
  
  function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const deepImportPattern = /from\s+['"]\.\.\/\.\.\//g;
    const matches = content.match(deepImportPattern);
    
    if (matches) {
      deepImportCount += matches.length;
      problematicFiles.push(path.relative(srcPath, filePath));
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
  
  if (deepImportCount === 0) {
    log('✅ No deep relative imports found', 'green');
    results.passed.push('Import Paths');
  } else {
    log(`⚠️  ${deepImportCount} deep relative imports in ${problematicFiles.length} files`, 'yellow');
    results.warnings.push(`Deep Imports (${problematicFiles.length} files)`);
    
    if (problematicFiles.length <= 10) {
      log('Files with deep imports:', 'yellow');
      problematicFiles.forEach(file => log(`  - ${file}`, 'yellow'));
    }
  }
}

// 4. Check for large files
function checkLargeFiles() {
  log('\n📊 Checking for large files...', 'cyan');
  
  const srcPath = path.join(__dirname, '..', 'flat', 'src');
  const largeFiles = [];
  const threshold = 400; // lines
  
  function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    
    if (lines > threshold) {
      largeFiles.push({
        file: path.relative(srcPath, filePath),
        lines
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
      } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.test.tsx')) {
        checkFile(filePath);
      }
    }
  }
  
  walkDir(srcPath);
  
  if (largeFiles.length === 0) {
    log(`✅ No files larger than ${threshold} lines`, 'green');
    results.passed.push('File Size');
  } else {
    log(`⚠️  ${largeFiles.length} files exceed ${threshold} lines`, 'yellow');
    results.warnings.push(`Large Files (${largeFiles.length})`);
    
    largeFiles.sort((a, b) => b.lines - a.lines).slice(0, 5).forEach(({ file, lines }) => {
      log(`  - ${file}: ${lines} lines`, 'yellow');
    });
  }
}

// 5. Check TypeScript compilation
function checkTypeScript() {
  log('\n📊 Checking TypeScript compilation...', 'cyan');
  
  const result = runCommand('npx tsc --noEmit', true);
  
  if (result.success) {
    log('✅ TypeScript compilation successful', 'green');
    results.passed.push('TypeScript');
  } else {
    log('❌ TypeScript compilation errors!', 'red');
    results.errors.push('TypeScript');
    
    // Show first few errors
    const errors = result.error.split('\n').slice(0, 10);
    errors.forEach(error => log(error, 'red'));
  }
}

// 6. Check for console.log statements
function checkConsoleLogs() {
  log('\n📊 Checking for console.log statements...', 'cyan');
  
  const srcPath = path.join(__dirname, '..', 'flat', 'src');
  const consoleLogFiles = [];
  
  function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const consolePattern = /console\.(log|error|warn|debug)/g;
    const matches = content.match(consolePattern);
    
    if (matches) {
      consoleLogFiles.push({
        file: path.relative(srcPath, filePath),
        count: matches.length
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
  
  if (consoleLogFiles.length === 0) {
    log('✅ No console statements found', 'green');
    results.passed.push('Console Statements');
  } else {
    const totalCount = consoleLogFiles.reduce((sum, f) => sum + f.count, 0);
    log(`⚠️  ${totalCount} console statements in ${consoleLogFiles.length} files`, 'yellow');
    results.warnings.push(`Console Statements (${consoleLogFiles.length} files)`);
  }
}

// 7. Check for unused exports
function checkUnusedExports() {
  log('\n📊 Checking for unused exports...', 'cyan');
  
  // This is a simplified check - for real unused export detection, use ts-prune
  if (fs.existsSync(path.join(__dirname, '..', 'node_modules', '.bin', 'ts-prune'))) {
    const result = runCommand('npx ts-prune --ignore "*.test.ts|*.test.tsx|*.stories.tsx"', true);
    
    if (result.success) {
      const lines = result.output.split('\n').filter(l => l.trim());
      if (lines.length === 0) {
        log('✅ No unused exports found', 'green');
        results.passed.push('Unused Exports');
      } else {
        log(`⚠️  ${lines.length} potentially unused exports`, 'yellow');
        results.warnings.push(`Unused Exports (${lines.length})`);
      }
    }
  } else {
    log('ℹ️  ts-prune not installed, skipping unused export check', 'blue');
  }
}

// 8. Check file naming conventions
function checkFileNaming() {
  log('\n📊 Checking file naming conventions...', 'cyan');
  
  const srcPath = path.join(__dirname, '..', 'flat', 'src');
  const incorrectFiles = [];
  
  function checkFile(filePath, file) {
    // Components should be PascalCase
    if (filePath.includes('/components/') && file.endsWith('.tsx')) {
      if (file !== 'index.tsx' && !/^[A-Z]/.test(file)) {
        incorrectFiles.push({
          file: path.relative(srcPath, filePath),
          issue: 'Component file should start with uppercase'
        });
      }
    }
    
    // Hooks should start with 'use'
    if (filePath.includes('/hooks/') && file.endsWith('.ts')) {
      if (!file.startsWith('use') && file !== 'index.ts') {
        incorrectFiles.push({
          file: path.relative(srcPath, filePath),
          issue: 'Hook file should start with "use"'
        });
      }
    }
    
    // Utils should be camelCase
    if (filePath.includes('/utils/') && file.endsWith('.ts')) {
      if (file !== 'index.ts' && /[A-Z]/.test(file[0])) {
        incorrectFiles.push({
          file: path.relative(srcPath, filePath),
          issue: 'Utility file should start with lowercase'
        });
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
        checkFile(filePath, file);
      }
    }
  }
  
  walkDir(srcPath);
  
  if (incorrectFiles.length === 0) {
    log('✅ All files follow naming conventions', 'green');
    results.passed.push('File Naming');
  } else {
    log(`⚠️  ${incorrectFiles.length} files with incorrect naming`, 'yellow');
    results.warnings.push(`File Naming (${incorrectFiles.length})`);
    
    incorrectFiles.slice(0, 5).forEach(({ file, issue }) => {
      log(`  - ${file}: ${issue}`, 'yellow');
    });
  }
}

// Main execution
function main() {
  log('\n════════════════════════════════════════════════', 'bright');
  log('    FLAT Dashboard - Comprehensive Code Check', 'bright');
  log('════════════════════════════════════════════════\n', 'bright');
  
  const startTime = Date.now();
  
  // Run all checks
  checkCircularDependencies();
  checkDuplicates();
  checkRelativeImports();
  checkLargeFiles();
  checkTypeScript();
  checkConsoleLogs();
  checkUnusedExports();
  checkFileNaming();
  
  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  log('\n════════════════════════════════════════════════', 'bright');
  log('                    SUMMARY', 'bright');
  log('════════════════════════════════════════════════', 'bright');
  
  if (results.passed.length > 0) {
    log('\n✅ Passed Checks:', 'green');
    results.passed.forEach(check => log(`   • ${check}`, 'green'));
  }
  
  if (results.warnings.length > 0) {
    log('\n⚠️  Warnings:', 'yellow');
    results.warnings.forEach(warning => log(`   • ${warning}`, 'yellow'));
  }
  
  if (results.errors.length > 0) {
    log('\n❌ Failed Checks:', 'red');
    results.errors.forEach(error => log(`   • ${error}`, 'red'));
  }
  
  log('\n────────────────────────────────────────────────', 'bright');
  
  const totalChecks = results.passed.length + results.warnings.length + results.errors.length;
  const score = Math.round((results.passed.length / totalChecks) * 100);
  
  log(`Total: ${results.passed.length}/${totalChecks} checks passed (${score}%)`, 'bright');
  log(`Time: ${duration}s`, 'bright');
  
  if (results.errors.length > 0) {
    log('\n⚠️  Please fix the errors before committing!', 'red');
    process.exit(1);
  } else if (results.warnings.length > 5) {
    log('\n⚠️  Consider addressing some warnings to improve code quality', 'yellow');
  } else {
    log('\n🎉 Code quality looks good!', 'green');
  }
}

// Run the checks
main();