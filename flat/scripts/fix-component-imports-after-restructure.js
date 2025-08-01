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

// Components that were converted to folder structure
const convertedComponents = [
  'CommentSection/CommentInput',
  'CommentSection/CommentItem',
  'CustomerModal/components/AdditionalInfoSection',
  'CustomerModal/components/BasicInfoSection',
  'CustomerModal/components/ContactInfoSection',
  'EmailModal/FactorySelector',
  'EmailModal/FileAttachment',
  'ErrorBoundary/ComponentErrorBoundary',
  'ErrorBoundary/ErrorFallback'
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

console.log(`\n${colors.blue}=== FIXING COMPONENT IMPORTS AFTER RESTRUCTURE ===${colors.reset}\n`);

const files = findFiles(srcDir);
console.log(`Found ${files.length} files to check`);

let updatedCount = 0;
const updatedFiles = [];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  convertedComponents.forEach(component => {
    // Match various import patterns
    const patterns = [
      // from "./ComponentName"
      new RegExp(`(\\./${component})(['"])`, 'g'),
      // from "../ComponentName"
      new RegExp(`(\\.\\./[^/]*)/${component}(['"])`, 'g'),
      // from "../../ComponentName"
      new RegExp(`(\\.\\./.*/[^/]*)/${component}(['"])`, 'g'),
      // from "@/components/ComponentName"
      new RegExp(`(@/components/)${component}(['"])`, 'g'),
    ];
    
    patterns.forEach(pattern => {
      const before = content;
      // Don't add /index if it's already there
      content = content.replace(pattern, (match, prefix, quote) => {
        if (!match.includes('/index')) {
          return `${prefix}/${component}/index${quote}`;
        }
        return match;
      });
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

console.log(`\n${colors.green}✓ Component import fixes complete!${colors.reset}`);