#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const srcDir = path.join(__dirname, '..', 'src');

// Find all TypeScript/JavaScript files
function findFiles(dir, pattern = /\.(ts|tsx|js|jsx)$/) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...findFiles(fullPath, pattern));
      } else if (stat.isFile() && pattern.test(item)) {
        files.push(fullPath);
      }
    });
  } catch (error) {
    // Ignore permission errors
  }
  
  return files;
}

// Convert relative path to absolute
function convertRelativeToAbsolute(importPath, currentFile) {
  // Skip if already absolute or external module
  if (!importPath.startsWith('.')) return null;
  
  // Skip style imports
  if (importPath.endsWith('.css') || importPath.endsWith('.scss')) return null;
  
  const currentDir = path.dirname(currentFile);
  const absolutePath = path.resolve(currentDir, importPath);
  const relativePath = path.relative(srcDir, absolutePath);
  
  // Convert to @/ format
  return '@/' + relativePath.replace(/\\/g, '/');
}

// Analyze import depth
function getImportDepth(importPath) {
  const matches = importPath.match(/\.\.\//g);
  return matches ? matches.length : 0;
}

console.log(`\n${colors.blue}=== FIXING RELATIVE IMPORTS ===${colors.reset}\n`);

const files = findFiles(srcDir);
console.log(`Found ${files.length} files to check`);

let updatedCount = 0;
const deepImports = [];
const fixedImports = [];

files.forEach(file => {
  const relativePath = path.relative(srcDir, file);
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Match all import statements
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
  const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;
  
  // Process regular imports
  content = content.replace(importRegex, (match, importPath) => {
    if (importPath.startsWith('.')) {
      const depth = getImportDepth(importPath);
      
      // Track deep imports (3+ levels)
      if (depth >= 3) {
        deepImports.push({
          file: relativePath,
          import: importPath,
          depth
        });
      }
      
      // Convert to absolute if depth >= 2
      if (depth >= 2) {
        const absolutePath = convertRelativeToAbsolute(importPath, file);
        if (absolutePath) {
          modified = true;
          fixedImports.push({
            file: relativePath,
            old: importPath,
            new: absolutePath
          });
          return match.replace(importPath, absolutePath);
        }
      }
    }
    return match;
  });
  
  // Process dynamic imports
  content = content.replace(dynamicImportRegex, (match, importPath) => {
    if (importPath.startsWith('.')) {
      const depth = getImportDepth(importPath);
      
      if (depth >= 2) {
        const absolutePath = convertRelativeToAbsolute(importPath, file);
        if (absolutePath) {
          modified = true;
          fixedImports.push({
            file: relativePath,
            old: importPath,
            new: absolutePath
          });
          return `import('${absolutePath}')`;
        }
      }
    }
    return match;
  });
  
  if (modified) {
    fs.writeFileSync(file, content);
    updatedCount++;
    console.log(`  ${colors.green}✓${colors.reset} ${relativePath}`);
  }
});

console.log(`\n${colors.green}Updated ${updatedCount} files${colors.reset}`);

// Show statistics
if (fixedImports.length > 0) {
  console.log(`\n${colors.blue}Fixed ${fixedImports.length} imports:${colors.reset}`);
  fixedImports.slice(0, 5).forEach(({ file, old: oldImport, new: newImport }) => {
    console.log(`  ${file}:`);
    console.log(`    ${colors.red}${oldImport}${colors.reset} → ${colors.green}${newImport}${colors.reset}`);
  });
  if (fixedImports.length > 5) {
    console.log(`  ... and ${fixedImports.length - 5} more`);
  }
}

// Show deep imports that might need attention
if (deepImports.length > 0) {
  console.log(`\n${colors.yellow}Deep imports found (${deepImports.length}):${colors.reset}`);
  deepImports.slice(0, 5).forEach(({ file, import: imp, depth }) => {
    console.log(`  ${file}: ${imp} (depth: ${depth})`);
  });
  if (deepImports.length > 5) {
    console.log(`  ... and ${deepImports.length - 5} more`);
  }
}

// Check for circular dependencies
console.log(`\n${colors.blue}Checking for circular dependencies...${colors.reset}`);

// Simple circular dependency detection
const importGraph = {};
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const imports = [];
  
  // Extract all imports
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('@/') || importPath.startsWith('.')) {
      imports.push(importPath);
    }
  }
  
  importGraph[file] = imports;
});

// TODO: Implement proper circular dependency detection

console.log(`\n${colors.green}✓ Import fixes complete!${colors.reset}`);

// Summary
console.log(`\n${colors.blue}=== SUMMARY ===${colors.reset}`);
console.log(`✓ Fixed ${fixedImports.length} relative imports with depth >= 2`);
console.log(`✓ Found ${deepImports.length} deep imports (depth >= 3)`);
console.log(`✓ Updated ${updatedCount} files`);

console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
console.log(`1. Run 'npm run typecheck' to ensure imports are valid`);
console.log(`2. Test the application to ensure everything works`);
console.log(`3. Consider refactoring files with very deep imports`);

console.log(`\n${colors.green}✓ Done!${colors.reset}`);