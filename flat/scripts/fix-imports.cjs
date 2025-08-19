#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'src');
let totalFixed = 0;
let filesFixed = 0;

function getAbsolutePath(fromFile, relativePath) {
  // Remove the relative part and any quotes
  const cleanPath = relativePath.replace(/^['"]\.\.\//, '').replace(/['"]$/, '');
  
  // Get the directory of the current file
  const fileDir = path.dirname(fromFile);
  
  // Resolve the absolute path
  const absolutePath = path.resolve(fileDir, '..', cleanPath);
  
  // Convert to @/ import path
  const srcRelative = path.relative(srcPath, absolutePath);
  
  // Convert backslashes to forward slashes for consistency
  return '@/' + srcRelative.replace(/\\/g, '/');
}

function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  let changes = 0;
  
  // Fix imports from '../
  modified = modified.replace(/from ['"](\.\.[^'"]+)['"]/g, (match, relativePath) => {
    if (relativePath.startsWith('../')) {
      const absolutePath = getAbsolutePath(filePath, relativePath);
      changes++;
      return `from '${absolutePath}'`;
    }
    return match;
  });
  
  // Fix requires (if any)
  modified = modified.replace(/require\(['"](\.\.[^'"]+)['"]\)/g, (match, relativePath) => {
    if (relativePath.startsWith('../')) {
      const absolutePath = getAbsolutePath(filePath, relativePath);
      changes++;
      return `require('${absolutePath}')`;
    }
    return match;
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

console.log('🔧 Fixing relative imports in src directory...\n');
walkDir(srcPath);

console.log('\n' + '='.repeat(50));
console.log(`✨ Fixed ${totalFixed} imports in ${filesFixed} files`);
console.log('='.repeat(50));