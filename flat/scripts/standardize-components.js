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

// Read components to fix
const componentsToFix = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'components-to-fix.json'), 'utf8')
);

// Convert single file component to folder structure
function convertSingleFileToFolder(componentPath) {
  const fullPath = path.join(srcDir, componentPath);
  const dir = path.dirname(fullPath);
  const fileName = path.basename(componentPath);
  const componentName = fileName.replace('.tsx', '');
  
  // Skip if it's a special file
  if (['App', 'main', 'vite-env.d'].includes(componentName)) {
    return false;
  }
  
  // Create component folder
  const componentDir = path.join(dir, componentName);
  
  // Check if folder already exists
  if (fs.existsSync(componentDir)) {
    console.log(`  ${colors.yellow}⚠${colors.reset} Folder already exists: ${componentName}`);
    return false;
  }
  
  // Create folder
  fs.mkdirSync(componentDir, { recursive: true });
  
  // Read original file content
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Write to index.tsx
  fs.writeFileSync(path.join(componentDir, 'index.tsx'), content);
  
  // Delete original file
  fs.unlinkSync(fullPath);
  
  console.log(`  ${colors.green}✓${colors.reset} Converted: ${componentPath} → ${componentName}/index.tsx`);
  return true;
}

// Add index.tsx to folders without it
function addIndexToFolder(folderPath) {
  const fullPath = path.join(srcDir, folderPath);
  const folderName = path.basename(folderPath);
  const componentFile = path.join(fullPath, `${folderName}.tsx`);
  const indexFile = path.join(fullPath, 'index.tsx');
  
  if (fs.existsSync(componentFile)) {
    // Read component file
    const content = fs.readFileSync(componentFile, 'utf8');
    
    // Check if it's the main component (exports default)
    if (content.includes('export default')) {
      // Create index.tsx that re-exports
      const indexContent = `export { default } from './${folderName}';\n`;
      fs.writeFileSync(indexFile, indexContent);
      
      console.log(`  ${colors.green}✓${colors.reset} Added index.tsx to: ${folderPath}`);
      return true;
    }
  }
  
  console.log(`  ${colors.yellow}⚠${colors.reset} Skipped: ${folderPath} (no default export found)`);
  return false;
}

// Clean up mixed structure folders
function cleanupMixedStructure(folderPath) {
  const fullPath = path.join(srcDir, folderPath);
  const folderName = path.basename(folderPath);
  const componentFile = path.join(fullPath, `${folderName}.tsx`);
  const indexFile = path.join(fullPath, 'index.tsx');
  
  if (fs.existsSync(componentFile) && fs.existsSync(indexFile)) {
    // Read both files
    const componentContent = fs.readFileSync(componentFile, 'utf8');
    const indexContent = fs.readFileSync(indexFile, 'utf8');
    
    // Check if index.tsx already exports from component file
    if (indexContent.includes(`from './${folderName}'`)) {
      console.log(`  ${colors.green}✓${colors.reset} Already properly structured: ${folderPath}`);
      return true;
    }
    
    // Otherwise, update index to re-export
    const newIndexContent = `export { default } from './${folderName}';\nexport * from './${folderName}';\n`;
    fs.writeFileSync(indexFile, newIndexContent);
    
    console.log(`  ${colors.green}✓${colors.reset} Fixed mixed structure: ${folderPath}`);
    return true;
  }
  
  console.log(`  ${colors.yellow}⚠${colors.reset} Manual review needed: ${folderPath}`);
  return false;
}

console.log(`\n${colors.blue}=== STANDARDIZING COMPONENT STRUCTURE ===${colors.reset}\n`);

// Process each type of fix
let convertedCount = 0;
let addedIndexCount = 0;
let cleanedUpCount = 0;

// Convert single files to folders (only do a few at a time to avoid too many changes)
console.log(`${colors.blue}Converting single file components:${colors.reset}`);
const singleFiles = componentsToFix.filter(c => c.type === 'single-file').slice(0, 10);
for (const component of singleFiles) {
  if (convertSingleFileToFolder(component.path)) {
    convertedCount++;
  }
}

// Add index.tsx to folders
console.log(`\n${colors.blue}Adding index.tsx to folders:${colors.reset}`);
const noIndexFolders = componentsToFix.filter(c => c.type === 'no-index');
for (const component of noIndexFolders) {
  if (addIndexToFolder(component.path)) {
    addedIndexCount++;
  }
}

// Clean up mixed structures
console.log(`\n${colors.blue}Cleaning up mixed structures:${colors.reset}`);
const mixedFolders = componentsToFix.filter(c => c.type === 'mixed');
for (const component of mixedFolders) {
  if (cleanupMixedStructure(component.path)) {
    cleanedUpCount++;
  }
}

// Update imports script
console.log(`\n${colors.blue}Creating import update script...${colors.reset}`);

// Generate import update mappings
const importMappings = singleFiles
  .filter(c => !['App', 'main', 'vite-env.d'].includes(path.basename(c.path).replace('.tsx', '')))
  .map(c => {
    const dir = path.dirname(c.path);
    const componentName = path.basename(c.path).replace('.tsx', '');
    const oldImport = dir === '.' ? componentName : `${dir}/${componentName}`;
    const newImport = dir === '.' ? `${componentName}` : `${dir}/${componentName}`;
    return { oldImport, newImport };
  });

// Save import mappings
fs.writeFileSync(
  path.join(__dirname, 'import-mappings.json'),
  JSON.stringify(importMappings, null, 2)
);

// Summary
console.log(`\n${colors.green}=== SUMMARY ===${colors.reset}\n`);
console.log(`✓ Converted ${convertedCount} single files to folder structure`);
console.log(`✓ Added index.tsx to ${addedIndexCount} folders`);
console.log(`✓ Cleaned up ${cleanedUpCount} mixed structure folders`);

console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
console.log(`1. Run import update script to fix all imports`);
console.log(`2. Test the application to ensure everything works`);
console.log(`3. Continue standardizing more components (${componentsToFix.filter(c => c.type === 'single-file').length - singleFiles.length} remaining)`);

console.log(`\n${colors.green}✓ Standardization complete!${colors.reset}`);