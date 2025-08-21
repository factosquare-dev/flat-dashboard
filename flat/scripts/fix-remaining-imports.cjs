#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'src');
let totalFixed = 0;
let filesFixed = 0;

function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  let changes = 0;
  
  // Fix @/../ imports by removing the extra ../
  modified = modified.replace(/@\/\.\.\//g, (match) => {
    changes++;
    return '@/';
  });
  
  if (changes > 0) {
    fs.writeFileSync(filePath, modified, 'utf8');
    totalFixed += changes;
    filesFixed++;
    console.log(`✅ Fixed ${changes} imports in ${path.relative(srcPath, filePath)}`);
  }
  
  return changes;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fixImportsInFile(filePath);
    }
  }
}

console.log('🔧 Fixing remaining @/../ import patterns...\n');
walkDir(srcPath);

console.log('\n' + '='.repeat(50));
console.log(`✨ Fixed ${totalFixed} imports in ${filesFixed} files`);
console.log('='.repeat(50));