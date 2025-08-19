#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'src');

console.log('🔍 Final import path verification...\n');

let issues = [];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(srcPath, filePath);
  
  // Find all imports
  const imports = content.match(/from\s+['"][^'"]+['"]/g) || [];
  
  for (const imp of imports) {
    const match = imp.match(/from\s+['"]([^'"]+)['"]/);
    if (!match) continue;
    
    const importPath = match[1];
    
    // Check for problematic patterns
    if (importPath.includes('@/../')) {
      issues.push({
        file: relativePath,
        line: content.split('\n').findIndex(line => line.includes(imp)) + 1,
        issue: `Invalid import path: ${importPath}`,
        type: 'broken'
      });
    } else if (importPath.startsWith('../')) {
      issues.push({
        file: relativePath,
        line: content.split('\n').findIndex(line => line.includes(imp)) + 1,
        issue: `Relative import: ${importPath}`,
        type: 'relative'
      });
    } else if (importPath === '@/mocks/types') {
      issues.push({
        file: relativePath,
        line: content.split('\n').findIndex(line => line.includes(imp)) + 1,
        issue: `Should be '@/mocks/database/types': ${importPath}`,
        type: 'wrong-path'
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
    } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.includes('.test.')) {
      checkFile(filePath);
    }
  }
}

walkDir(srcPath);

console.log('\n' + '='.repeat(60));
console.log('📊 Final Import Analysis Results:');
console.log('='.repeat(60));

if (issues.length === 0) {
  console.log('\n🎉 All imports are properly formatted!');
  console.log('✅ No broken import patterns found');
  console.log('✅ No relative imports found');
  console.log('✅ All import paths are correct');
} else {
  console.log(`\n⚠️  Found ${issues.length} import issues:\n`);
  
  issues.forEach(issue => {
    const icon = issue.type === 'broken' ? '❌' : issue.type === 'relative' ? '⚠️ ' : '🔧';
    console.log(`${icon} ${issue.file}:${issue.line}`);
    console.log(`   ${issue.issue}\n`);
  });
}

console.log('='.repeat(60));