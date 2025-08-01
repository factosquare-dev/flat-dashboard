#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Configuration
const config = {
  dryRun: process.argv.includes('--dry-run'),
  srcDir: path.join(__dirname, '..', 'src'),
  libDir: path.join(__dirname, '..', 'src', 'lib'),
  backupDir: path.join(__dirname, '..', 'src-lib-backup')
};

// Get all files recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.git')) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(filePath);
    }
  });
  
  return arrayOfFiles;
}

// Update imports in a file
function updateImports(filePath, importMap) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace lib imports with their src equivalents
  const importRegex = /from\s+['"]([^'"]+)['"]/g;
  content = content.replace(importRegex, (match, importPath) => {
    if (importPath.includes('/lib/')) {
      const newPath = importPath.replace('/lib/', '/');
      if (newPath !== importPath) {
        modified = true;
        return `from '${newPath}'`;
      }
    }
    
    // Handle relative imports that go into lib
    if (importPath.startsWith('.') && importPath.includes('/lib/')) {
      const absolutePath = path.resolve(path.dirname(filePath), importPath);
      const relativePath = path.relative(config.srcDir, absolutePath);
      
      if (relativePath.startsWith('lib/')) {
        const newRelativePath = relativePath.substring(4); // Remove 'lib/'
        const newAbsolutePath = path.join(config.srcDir, newRelativePath);
        const newImportPath = path.relative(path.dirname(filePath), newAbsolutePath);
        
        if (fs.existsSync(newAbsolutePath)) {
          modified = true;
          return `from './${newImportPath.replace(/\\/g, '/')}'`;
        }
      }
    }
    
    return match;
  });
  
  // Also handle @ imports
  const atImportRegex = /from\s+['"]@\/lib\/([^'"]+)['"]/g;
  content = content.replace(atImportRegex, (match, libPath) => {
    modified = true;
    return `from '@/${libPath}'`;
  });
  
  if (modified && !config.dryRun) {
    fs.writeFileSync(filePath, content);
  }
  
  return modified;
}

// Main function
async function removeDuplicates() {
  console.log(`\n${colors.blue}=== REMOVING LIB DUPLICATES ===${colors.reset}\n`);
  
  if (config.dryRun) {
    console.log(`${colors.yellow}DRY RUN MODE - No files will be modified${colors.reset}\n`);
  }
  
  // Step 1: Create backup
  if (!config.dryRun && !fs.existsSync(config.backupDir)) {
    console.log(`${colors.green}Creating backup of lib directory...${colors.reset}`);
    fs.cpSync(config.libDir, config.backupDir, { recursive: true });
    console.log(`Backup created at: ${config.backupDir}\n`);
  }
  
  // Step 2: Get all source files
  const allFiles = getAllFiles(config.srcDir)
    .filter(f => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx'));
  
  // Step 3: Update imports
  console.log(`${colors.yellow}Updating imports in ${allFiles.length} files...${colors.reset}`);
  let updatedCount = 0;
  
  for (const file of allFiles) {
    if (updateImports(file, {})) {
      updatedCount++;
      const relativePath = path.relative(config.srcDir, file);
      console.log(`  Updated: ${relativePath}`);
    }
  }
  
  console.log(`\n${colors.green}Updated ${updatedCount} files${colors.reset}`);
  
  // Step 4: Remove duplicate files from lib
  console.log(`\n${colors.yellow}Removing duplicate files from lib...${colors.reset}`);
  
  const duplicates = [
    'config', 'constants', 'contexts', 'data', 'errors',
    'hooks', 'services', 'stores', 'types', 'utils', 'validation',
    'ui-components/Badge', 'ui-components/BaseModal.css', 'ui-components/BaseModal.tsx',
    'ui-components/Card', 'ui-components/CompoundComponents.tsx', 'ui-components/EmptyState.css',
    'ui-components/EmptyState.tsx', 'ui-components/ErrorBoundary', 'ui-components/FactoryTypeBadge.css',
    'ui-components/FactoryTypeBadge.tsx', 'ui-components/FloatingActionButton.css',
    'ui-components/FloatingActionButton.tsx', 'ui-components/Form', 'ui-components/FormGroup.tsx',
    'ui-components/FormInput.css', 'ui-components/FormInput.tsx', 'ui-components/FormSection',
    'ui-components/FormSelect.tsx', 'ui-components/FormTextarea.tsx', 'ui-components/LazyBoundary.tsx',
    'ui-components/LoadingRenderer.tsx', 'ui-components/LoadingScreen.css', 'ui-components/LoadingScreen.tsx',
    'ui-components/LoadingState.css', 'ui-components/LoadingState.tsx', 'ui-components/Modal',
    'ui-components/ModalField.tsx', 'ui-components/ModalRenderer.tsx', 'ui-components/ModalSection.tsx',
    'ui-components/PageLayout.tsx', 'ui-components/Skeleton.css', 'ui-components/Skeleton.tsx',
    'ui-components/StatusBadge.css', 'ui-components/StatusBadge.tsx', 'ui-components/Table',
    'ui-components/Toast.css', 'ui-components/Toast.tsx', 'ui-components/ValidationMessage.tsx',
    'ui-components/VirtualList.css', 'ui-components/VirtualList.tsx', 'ui-components/loading'
  ];
  
  let removedCount = 0;
  
  for (const dup of duplicates) {
    const fullPath = path.join(config.libDir, dup);
    if (fs.existsSync(fullPath)) {
      if (!config.dryRun) {
        if (fs.statSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
      }
      removedCount++;
      console.log(`  Removed: lib/${dup}`);
    }
  }
  
  console.log(`\n${colors.green}Removed ${removedCount} duplicate items${colors.reset}`);
  
  // Step 5: Clean up empty directories
  console.log(`\n${colors.yellow}Cleaning up empty directories...${colors.reset}`);
  cleanEmptyDirs(config.libDir);
  
  // Summary
  console.log(`\n${colors.blue}=== SUMMARY ===${colors.reset}`);
  console.log(`Files updated: ${updatedCount}`);
  console.log(`Duplicates removed: ${removedCount}`);
  
  if (config.dryRun) {
    console.log(`\n${colors.yellow}This was a dry run. Run without --dry-run to apply changes.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}✓ Lib duplicates successfully removed!${colors.reset}`);
    console.log(`${colors.yellow}Backup saved at: ${config.backupDir}${colors.reset}`);
  }
}

// Clean empty directories
function cleanEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  if (files.length > 0) {
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        cleanEmptyDirs(fullPath);
      }
    });
    
    // Re-check after recursive cleaning
    const filesAfter = fs.readdirSync(dir);
    if (filesAfter.length === 0 && !config.dryRun) {
      fs.rmdirSync(dir);
      console.log(`  Removed empty dir: ${path.relative(config.srcDir, dir)}`);
    }
  } else if (!config.dryRun) {
    fs.rmdirSync(dir);
    console.log(`  Removed empty dir: ${path.relative(config.srcDir, dir)}`);
  }
}

// Run the script
removeDuplicates().catch(console.error);