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

// Component patterns to analyze
const patterns = {
  folderWithIndex: [],     // ComponentName/index.tsx
  singleFile: [],          // ComponentName.tsx
  folderWithoutIndex: [],  // ComponentName/ComponentName.tsx
  mixedStructure: []       // Folders with both patterns
};

function analyzeDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      // Check if it's a component directory
      const files = fs.readdirSync(fullPath);
      const hasIndexTsx = files.includes('index.tsx');
      const hasIndexTs = files.includes('index.ts');
      const hasComponentFile = files.includes(`${item}.tsx`);
      const hasTsxFiles = files.some(f => f.endsWith('.tsx') && f !== 'index.tsx');
      
      // Skip non-component directories
      if (!hasIndexTsx && !hasIndexTs && !hasComponentFile && !hasTsxFiles) {
        analyzeDirectory(fullPath);
        return;
      }
      
      const relativePath = path.relative(srcDir, fullPath);
      
      if ((hasIndexTsx || hasIndexTs) && !hasComponentFile) {
        patterns.folderWithIndex.push(relativePath);
      } else if (hasComponentFile && !hasIndexTsx && !hasIndexTs) {
        patterns.folderWithoutIndex.push(relativePath);
      } else if ((hasIndexTsx || hasIndexTs) && hasComponentFile) {
        patterns.mixedStructure.push(relativePath);
      }
      
      // Continue analyzing subdirectories
      analyzeDirectory(fullPath);
    } else if (stat.isFile() && item.endsWith('.tsx')) {
      // Check for single file components
      const componentName = item.replace('.tsx', '');
      const dirName = path.basename(dir);
      
      // Skip if it's inside a component folder
      if (dirName === componentName || dir.includes(`/${componentName}/`)) {
        return;
      }
      
      // Skip common non-component files
      if (['index', 'types', 'utils', 'constants', 'hooks'].includes(componentName)) {
        return;
      }
      
      // Check if it starts with uppercase (likely a component)
      if (componentName[0] === componentName[0].toUpperCase()) {
        const relativePath = path.relative(srcDir, fullPath);
        patterns.singleFile.push(relativePath);
      }
    }
  });
}

console.log(`\n${colors.blue}=== COMPONENT STRUCTURE ANALYSIS ===${colors.reset}\n`);

analyzeDirectory(srcDir);

// Display results
console.log(`${colors.green}✓ Folder with index.tsx (Recommended):${colors.reset} ${patterns.folderWithIndex.length}`);
patterns.folderWithIndex.slice(0, 5).forEach(p => console.log(`  - ${p}`));
if (patterns.folderWithIndex.length > 5) {
  console.log(`  ... and ${patterns.folderWithIndex.length - 5} more`);
}

console.log(`\n${colors.yellow}⚠ Single file components:${colors.reset} ${patterns.singleFile.length}`);
patterns.singleFile.slice(0, 5).forEach(p => console.log(`  - ${p}`));
if (patterns.singleFile.length > 5) {
  console.log(`  ... and ${patterns.singleFile.length - 5} more`);
}

console.log(`\n${colors.yellow}⚠ Folder without index.tsx:${colors.reset} ${patterns.folderWithoutIndex.length}`);
patterns.folderWithoutIndex.slice(0, 5).forEach(p => console.log(`  - ${p}`));
if (patterns.folderWithoutIndex.length > 5) {
  console.log(`  ... and ${patterns.folderWithoutIndex.length - 5} more`);
}

console.log(`\n${colors.red}✗ Mixed structure (needs cleanup):${colors.reset} ${patterns.mixedStructure.length}`);
patterns.mixedStructure.forEach(p => console.log(`  - ${p}`));

// Recommendations
console.log(`\n${colors.blue}=== RECOMMENDATIONS ===${colors.reset}\n`);
console.log(`1. Convert ${patterns.singleFile.length} single file components to folder structure`);
console.log(`2. Add index.tsx to ${patterns.folderWithoutIndex.length} component folders`);
console.log(`3. Clean up ${patterns.mixedStructure.length} folders with mixed structure`);

// Generate list of components to fix
const componentsToFix = [
  ...patterns.singleFile.map(p => ({ path: p, type: 'single-file' })),
  ...patterns.folderWithoutIndex.map(p => ({ path: p, type: 'no-index' })),
  ...patterns.mixedStructure.map(p => ({ path: p, type: 'mixed' }))
];

// Save to file for processing
fs.writeFileSync(
  path.join(__dirname, 'components-to-fix.json'),
  JSON.stringify(componentsToFix, null, 2)
);

console.log(`\n${colors.green}✓ Analysis complete!${colors.reset}`);
console.log(`  Results saved to: scripts/components-to-fix.json`);