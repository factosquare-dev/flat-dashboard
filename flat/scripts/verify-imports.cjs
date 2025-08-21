#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'src');

console.log('🔍 Verifying import fixes...\n');

// Check for remaining relative imports
let relativeImports = 0;
let absoluteImports = 0;
let brokenImports = 0;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(srcPath, filePath);
  
  // Find all imports
  const imports = content.match(/from\s+['"][^'"]+['"]/g) || [];
  
  for (const imp of imports) {
    const match = imp.match(/from\s+['"]([^'"]+)['"]/);
    if (!match) continue;
    
    const importPath = match[1];
    
    if (importPath.startsWith('../')) {
      console.log(`❌ Relative import in ${relativePath}: ${importPath}`);
      relativeImports++;
    } else if (importPath.startsWith('@/')) {
      absoluteImports++;
    } else if (importPath.startsWith('@/../')) {
      console.log(`⚠️  Double-dot import in ${relativePath}: ${importPath}`);
      brokenImports++;
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

console.log('\n' + '='.repeat(50));
console.log(`📊 Import Analysis Results:`);
console.log(`   ✅ Absolute imports (@/): ${absoluteImports}`);
console.log(`   ❌ Relative imports (../): ${relativeImports}`);
console.log(`   ⚠️  Broken imports (@/../): ${brokenImports}`);

if (relativeImports === 0 && brokenImports === 0) {
  console.log('\n🎉 All imports are properly formatted!');
} else {
  console.log('\n⚠️  Some imports need attention.');
}

console.log('='.repeat(50));