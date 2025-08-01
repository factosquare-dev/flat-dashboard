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

// Replacements for common magic values
const replacements = [
  // Timeout replacements
  {
    pattern: /setTimeout\([^,]+,\s*300\)/g,
    replacement: (match) => match.replace('300', 'UI_TIMEOUTS.DEFAULT_DELAY'),
    importNeeded: { name: 'UI_TIMEOUTS', from: '@/constants/ui' }
  },
  {
    pattern: /delay:\s*300/g,
    replacement: 'delay: UI_TIMEOUTS.DEFAULT_DELAY',
    importNeeded: { name: 'UI_TIMEOUTS', from: '@/constants/ui' }
  },
  {
    pattern: /timeout:\s*30000/g,
    replacement: 'timeout: UI_TIMEOUTS.API_TIMEOUT',
    importNeeded: { name: 'UI_TIMEOUTS', from: '@/constants/ui' }
  },
  
  // Grid replacements (skip CSS classes for now)
  {
    pattern: /grid-cols-2/g,
    replacement: 'grid-cols-2', // CSS class, handle separately
    importNeeded: { name: 'GRID_CONFIG', from: '@/constants/ui' },
    skipPattern: true // This is a CSS class, handle differently
  },
  
  // Textarea rows
  {
    pattern: /rows=\{?2\}?/g,
    replacement: 'rows={TEXTAREA_ROWS.SMALL}',
    importNeeded: { name: 'TEXTAREA_ROWS', from: '@/constants/ui' }
  },
  {
    pattern: /rows=\{?3\}?/g,
    replacement: 'rows={TEXTAREA_ROWS.MEDIUM}',
    importNeeded: { name: 'TEXTAREA_ROWS', from: '@/constants/ui' }
  },
  {
    pattern: /rows=\{?6\}?/g,
    replacement: 'rows={TEXTAREA_ROWS.LARGE}',
    importNeeded: { name: 'TEXTAREA_ROWS', from: '@/constants/ui' }
  },
  
  // Icon sizes (in className)
  {
    pattern: /className="[^"]*w-5 h-5[^"]*"/g,
    replacement: (match) => {
      // This is complex, skip for now
      return match;
    },
    skipPattern: true
  }
];

// Find all TypeScript/JavaScript files
function findFiles(dir, pattern = /\.(ts|tsx)$/) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== '__tests__') {
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

// Check if import already exists
function hasImport(content, importName, fromPath) {
  const importRegex = new RegExp(`import.*{[^}]*${importName}[^}]*}.*from.*['"]${fromPath}['"]`);
  return importRegex.test(content);
}

// Add import to file
function addImport(content, imports) {
  const uniqueImports = new Map();
  imports.forEach(imp => {
    if (!uniqueImports.has(imp.from)) {
      uniqueImports.set(imp.from, new Set());
    }
    uniqueImports.get(imp.from).add(imp.name);
  });
  
  let newImports = '';
  uniqueImports.forEach((names, from) => {
    newImports += `import { ${Array.from(names).join(', ')} } from '${from}';\n`;
  });
  
  // Find the last import statement
  const importRegex = /^import\s+.*$/gm;
  const existingImports = content.match(importRegex);
  
  if (existingImports && existingImports.length > 0) {
    const lastImport = existingImports[existingImports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertPosition = lastImportIndex + lastImport.length;
    
    return content.slice(0, insertPosition) + '\n' + newImports.trim() + content.slice(insertPosition);
  } else {
    // No imports found, add at the beginning
    return newImports + '\n' + content;
  }
}

console.log(`\n${colors.blue}=== REPLACING MAGIC VALUES WITH CONSTANTS ===${colors.reset}\n`);

// Only process a few files as example
const files = findFiles(srcDir).slice(0, 10);
console.log(`Processing ${files.length} files as example...`);

let updatedCount = 0;
const updatedFiles = [];

files.forEach(file => {
  const relativePath = path.relative(srcDir, file);
  
  // Skip constants files
  if (relativePath.includes('constants/')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  const neededImports = [];
  
  replacements.forEach(({ pattern, replacement, importNeeded, skipPattern }) => {
    if (skipPattern) return;
    
    const before = content;
    if (typeof replacement === 'string') {
      content = content.replace(pattern, replacement);
    } else {
      content = content.replace(pattern, replacement);
    }
    
    if (before !== content) {
      modified = true;
      if (importNeeded && !hasImport(content, importNeeded.name, importNeeded.from)) {
        neededImports.push(importNeeded);
      }
    }
  });
  
  if (modified && neededImports.length > 0) {
    content = addImport(content, neededImports);
    fs.writeFileSync(file, content);
    updatedCount++;
    updatedFiles.push(relativePath);
    console.log(`  ${colors.green}✓${colors.reset} ${relativePath}`);
  }
});

console.log(`\n${colors.green}Updated ${updatedCount} files${colors.reset}`);

console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
console.log(`1. Review the changes to ensure they're correct`);
console.log(`2. Run the script on more files to replace more magic values`);
console.log(`3. Manually update CSS classes that use magic numbers`);
console.log(`4. Add more constants as needed`);

console.log(`\n${colors.green}✓ Magic value replacement complete!${colors.reset}`);