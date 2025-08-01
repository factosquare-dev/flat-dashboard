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

console.log(`\n${colors.blue}=== CONSOLIDATING UTILS DIRECTORIES ===${colors.reset}\n`);

// Find all utils directories
const utilsDirs = [];

function findUtilsDirs(dir, depth = 0) {
  if (depth > 5) return; // Prevent too deep recursion
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      if (file === 'utils' && !fullPath.includes('node_modules')) {
        utilsDirs.push(fullPath);
      } else if (!file.startsWith('.') && file !== 'node_modules') {
        findUtilsDirs(fullPath, depth + 1);
      }
    }
  });
}

findUtilsDirs(srcDir);

console.log(`${colors.yellow}Found ${utilsDirs.length} utils directories:${colors.reset}`);
utilsDirs.forEach(dir => {
  const relativePath = path.relative(srcDir, dir);
  console.log(`  ${relativePath}`);
});

// Analyze contents
const mainUtils = path.join(srcDir, 'utils');
const utilsContents = new Map();

utilsDirs.forEach(utilsDir => {
  const relativePath = path.relative(srcDir, utilsDir);
  const files = fs.readdirSync(utilsDir).filter(f => !f.startsWith('.'));
  
  files.forEach(file => {
    if (!utilsContents.has(file)) {
      utilsContents.set(file, []);
    }
    utilsContents.get(file).push(relativePath);
  });
});

// Show duplicates
console.log(`\n${colors.red}Duplicate util files:${colors.reset}`);
let duplicateCount = 0;

utilsContents.forEach((locations, file) => {
  if (locations.length > 1) {
    duplicateCount++;
    console.log(`  ${colors.yellow}${file}${colors.reset} found in:`);
    locations.forEach(loc => console.log(`    - ${loc}`));
  }
});

// Show unique files in non-main utils
console.log(`\n${colors.green}Unique files in component utils:${colors.reset}`);
utilsDirs.forEach(utilsDir => {
  if (utilsDir === mainUtils) return;
  
  const relativePath = path.relative(srcDir, utilsDir);
  const files = fs.readdirSync(utilsDir).filter(f => !f.startsWith('.'));
  const uniqueFiles = files.filter(f => {
    const locations = utilsContents.get(f);
    return locations.length === 1;
  });
  
  if (uniqueFiles.length > 0) {
    console.log(`  ${relativePath}:`);
    uniqueFiles.forEach(f => console.log(`    - ${f}`));
  }
});

// Recommendations
console.log(`\n${colors.blue}=== RECOMMENDATIONS ===${colors.reset}`);
console.log(`\n1. Move component-specific utils to main utils with proper naming:`);
console.log(`   - components/Schedule/utils/* -> utils/schedule/*`);
console.log(`   - components/CustomerModal/utils/* -> utils/customer/*`);
console.log(`   - components/GanttChart/utils/* -> utils/gantt/*`);

console.log(`\n2. Remove empty utils directories after moving files`);

console.log(`\n3. Update imports to use the consolidated utils`);

// Show sample moves
console.log(`\n${colors.yellow}Sample moves:${colors.reset}`);
utilsDirs.forEach(utilsDir => {
  if (utilsDir === mainUtils) return;
  
  const component = path.basename(path.dirname(utilsDir));
  const files = fs.readdirSync(utilsDir).filter(f => !f.startsWith('.'));
  
  if (files.length > 0) {
    console.log(`\n  ${component}:`);
    files.forEach(file => {
      const oldPath = path.relative(srcDir, path.join(utilsDir, file));
      const newPath = `utils/${component.toLowerCase()}/${file}`;
      console.log(`    ${oldPath} -> ${newPath}`);
    });
  }
});