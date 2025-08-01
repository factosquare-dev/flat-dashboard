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

// Import mappings from the standardization script
const importMappings = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'import-mappings.json'), 'utf8')
);

// Additional manual mappings for components we just converted
const additionalMappings = [
  { old: 'CommentSection/CommentInput', new: 'CommentSection/CommentInput' },
  { old: 'CommentSection/CommentItem', new: 'CommentSection/CommentItem' },
  { old: 'CustomerModal/components/AdditionalInfoSection', new: 'CustomerModal/components/AdditionalInfoSection' },
  { old: 'CustomerModal/components/BasicInfoSection', new: 'CustomerModal/components/BasicInfoSection' },
  { old: 'CustomerModal/components/ContactInfoSection', new: 'CustomerModal/components/ContactInfoSection' },
  { old: 'EmailModal/FactorySelector', new: 'EmailModal/FactorySelector' },
  { old: 'EmailModal/FileAttachment', new: 'EmailModal/FileAttachment' },
  { old: 'ErrorBoundary/ComponentErrorBoundary', new: 'ErrorBoundary/ComponentErrorBoundary' },
  { old: 'ErrorBoundary/ErrorFallback', new: 'ErrorBoundary/ErrorFallback' },
];

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

console.log(`\n${colors.blue}=== UPDATING COMPONENT IMPORTS ===${colors.reset}\n`);

const files = findFiles(srcDir);
console.log(`Found ${files.length} files to check`);

let updatedCount = 0;
const updatedFiles = [];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Check each mapping
  additionalMappings.forEach(({ old: oldImport, new: newImport }) => {
    // Create regex patterns for different import styles
    const patterns = [
      // import Component from './path/Component'
      new RegExp(`(import\\s+\\w+\\s+from\\s+['"]\\..*?/)${oldImport}(['"])`, 'g'),
      // import { Component } from './path/Component'
      new RegExp(`(import\\s*{[^}]*}\\s*from\\s+['"]\\..*?/)${oldImport}(['"])`, 'g'),
      // import * as Component from './path/Component'
      new RegExp(`(import\\s*\\*\\s*as\\s+\\w+\\s+from\\s+['"]\\..*?/)${oldImport}(['"])`, 'g'),
      // dynamic imports
      new RegExp(`(import\\(['"]\\..*?/)${oldImport}(['"]\\))`, 'g'),
    ];
    
    patterns.forEach(pattern => {
      const before = content;
      content = content.replace(pattern, `$1${newImport}$2`);
      if (before !== content) {
        modified = true;
      }
    });
  });
  
  if (modified) {
    fs.writeFileSync(file, content);
    updatedCount++;
    const relativePath = path.relative(srcDir, file);
    updatedFiles.push(relativePath);
    console.log(`  ${colors.green}✓${colors.reset} ${relativePath}`);
  }
});

console.log(`\n${colors.green}Updated ${updatedCount} files${colors.reset}`);

if (updatedFiles.length > 0) {
  console.log(`\n${colors.blue}Files updated:${colors.reset}`);
  updatedFiles.slice(0, 10).forEach(f => console.log(`  - ${f}`));
  if (updatedFiles.length > 10) {
    console.log(`  ... and ${updatedFiles.length - 10} more`);
  }
}

console.log(`\n${colors.green}✓ Import updates complete!${colors.reset}`);