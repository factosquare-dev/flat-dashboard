#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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
const targetDir = path.join(srcDir, 'components/forms');

// Get file hash
function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}

console.log(`\n${colors.blue}=== CONSOLIDATING FORM COMPONENTS ===${colors.reset}\n`);

// Step 1: Analyze all form components
const formFiles = new Map();
const locations = [
  { dir: 'components/Form', files: ['FormField.tsx', 'Form.tsx', 'useFormValidation.ts'] },
  { dir: 'components/forms', files: ['FormField.tsx', 'FormInput.tsx', 'FormSelect.tsx', 'FormTextarea.tsx'] },
  { dir: 'components/common', files: ['FormInput.tsx', 'FormSelect.tsx', 'FormTextarea.tsx', 'FormGroup.tsx', 'ValidationMessage.tsx'] },
  { dir: 'components/common/FormSection', files: ['FormField.tsx', 'FormRow.tsx', 'FormSection.tsx'] },
  { dir: 'components/Factories/components', files: ['FormField.tsx'] }
];

// Collect all form files with their hashes
locations.forEach(({ dir, files }) => {
  files.forEach(file => {
    const fullPath = path.join(srcDir, dir, file);
    if (fs.existsSync(fullPath)) {
      const hash = getFileHash(fullPath);
      if (!formFiles.has(file)) {
        formFiles.set(file, []);
      }
      formFiles.get(file).push({ path: fullPath, dir, hash });
    }
  });
});

// Step 2: Determine which version to keep
console.log(`${colors.yellow}Analyzing form components...${colors.reset}`);
const filesToKeep = new Map();

formFiles.forEach((locations, fileName) => {
  console.log(`\n${colors.green}${fileName}:${colors.reset}`);
  
  // Group by hash
  const hashGroups = new Map();
  locations.forEach(loc => {
    if (!hashGroups.has(loc.hash)) {
      hashGroups.set(loc.hash, []);
    }
    hashGroups.get(loc.hash).push(loc);
  });
  
  if (hashGroups.size === 1) {
    console.log(`  All ${locations.length} copies are identical`);
    filesToKeep.set(fileName, locations[0]);
  } else {
    console.log(`  Found ${hashGroups.size} different versions:`);
    
    // Choose the version from components/forms or components/common
    let chosen = locations.find(loc => loc.dir === 'components/forms') ||
                 locations.find(loc => loc.dir === 'components/common') ||
                 locations[0];
    
    hashGroups.forEach((locs, hash) => {
      const dirs = locs.map(l => l.dir).join(', ');
      const isChosen = locs.some(l => l.path === chosen.path);
      console.log(`    ${isChosen ? '✓' : ' '} ${dirs} (${locs.length} copies)`);
    });
    
    filesToKeep.set(fileName, chosen);
  }
});

// Step 3: Copy chosen files to target directory
console.log(`\n${colors.blue}Consolidating to ${path.relative(srcDir, targetDir)}...${colors.reset}`);

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

filesToKeep.forEach((location, fileName) => {
  const targetPath = path.join(targetDir, fileName);
  
  // Skip if already in target location
  if (location.path === targetPath) {
    console.log(`  ${colors.green}✓${colors.reset} ${fileName} (already in place)`);
    return;
  }
  
  // Copy file
  fs.copyFileSync(location.path, targetPath);
  console.log(`  ${colors.green}✓${colors.reset} ${fileName} copied from ${location.dir}`);
});

// Step 4: Copy CSS files
const cssFiles = [
  'components/common/FormInput.css',
  'components/Factories/components/FormField.css'
];

cssFiles.forEach(cssFile => {
  const sourcePath = path.join(srcDir, cssFile);
  if (fs.existsSync(sourcePath)) {
    const fileName = path.basename(cssFile);
    const targetPath = path.join(targetDir, fileName);
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`  ${colors.green}✓${colors.reset} ${fileName} (CSS)`);
  }
});

// Step 5: Create unified index.ts
const indexContent = `// Unified Form Components
export { default as Form } from './Form';
export { default as FormField } from './FormField';
export { default as FormInput } from './FormInput';
export { default as FormSelect } from './FormSelect';
export { default as FormTextarea } from './FormTextarea';
export { default as FormGroup } from './FormGroup';
export { default as FormSection } from './FormSection';
export { default as FormRow } from './FormRow';
export { default as ValidationMessage } from './ValidationMessage';

// Hooks
export { useFormValidation } from './useFormValidation';

// Types
export type { FormFieldProps } from './FormField';
export type { FormSectionProps, FormRowProps } from './types';
`;

fs.writeFileSync(path.join(targetDir, 'index.ts'), indexContent);
console.log(`  ${colors.green}✓${colors.reset} Created unified index.ts`);

// Step 6: Show cleanup recommendations
console.log(`\n${colors.blue}=== CLEANUP RECOMMENDATIONS ===${colors.reset}`);
console.log(`\nAfter verifying the consolidated forms work correctly, remove:`);
console.log(`  - components/Form/`);
console.log(`  - components/common/Form*`);
console.log(`  - components/common/ValidationMessage.tsx`);
console.log(`  - components/Factories/components/FormField.*`);

console.log(`\n${colors.yellow}Update imports in:${colors.reset}`);
console.log(`  - All components using form components`);
console.log(`  - Replace various imports with: @/components/forms`);

console.log(`\n${colors.green}✓ Form consolidation complete!${colors.reset}`);