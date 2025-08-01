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

console.log(`\n${colors.blue}=== ANALYZING FORM COMPONENTS ===${colors.reset}\n`);

// Find all form-related directories and files
const formLocations = [
  'components/Form',
  'components/forms',
  'components/common/Form',
  'components/common/FormSection',
  'components/common/FormInput.tsx',
  'components/common/FormSelect.tsx',
  'components/common/FormTextarea.tsx',
  'components/common/FormGroup.tsx',
  'components/ui',
  'components/Factories/components'
];

const formComponents = new Map();

// Analyze each location
formLocations.forEach(location => {
  const fullPath = path.join(srcDir, location);
  
  if (!fs.existsSync(fullPath)) {
    return;
  }
  
  const stat = fs.statSync(fullPath);
  
  if (stat.isDirectory()) {
    const files = fs.readdirSync(fullPath);
    files.forEach(file => {
      if (file.startsWith('Form') || file.includes('Field')) {
        if (!formComponents.has(file)) {
          formComponents.set(file, []);
        }
        formComponents.get(file).push(location);
      }
    });
  } else if (stat.isFile()) {
    const fileName = path.basename(location);
    if (!formComponents.has(fileName)) {
      formComponents.set(fileName, []);
    }
    formComponents.get(fileName).push(path.dirname(location));
  }
});

// Show duplicates
console.log(`${colors.red}Duplicate form components:${colors.reset}`);
let duplicateCount = 0;

formComponents.forEach((locations, component) => {
  if (locations.length > 1) {
    duplicateCount++;
    console.log(`  ${colors.yellow}${component}${colors.reset} found in:`);
    locations.forEach(loc => console.log(`    - ${loc}`));
  }
});

// Analyze form component structure
console.log(`\n${colors.blue}Form component structure:${colors.reset}`);

// Check components/Form
const formDir = path.join(srcDir, 'components/Form');
if (fs.existsSync(formDir)) {
  console.log(`\n${colors.yellow}components/Form:${colors.reset}`);
  const files = fs.readdirSync(formDir);
  files.forEach(file => console.log(`  - ${file}`));
}

// Check components/forms
const formsDir = path.join(srcDir, 'components/forms');
if (fs.existsSync(formsDir)) {
  console.log(`\n${colors.yellow}components/forms:${colors.reset}`);
  const files = fs.readdirSync(formsDir);
  files.forEach(file => console.log(`  - ${file}`));
}

// Check components/common form components
console.log(`\n${colors.yellow}components/common (form-related):${colors.reset}`);
const commonDir = path.join(srcDir, 'components/common');
if (fs.existsSync(commonDir)) {
  const files = fs.readdirSync(commonDir);
  files.filter(f => f.startsWith('Form') || f.includes('Validation')).forEach(file => {
    console.log(`  - ${file}`);
  });
}

// Check specific form implementations
console.log(`\n${colors.green}Specific form implementations:${colors.reset}`);
const specificForms = [
  'components/Factories/components/FormField.tsx',
  'components/CustomerModal/index.tsx',
  'components/ProjectModal/index.tsx'
];

specificForms.forEach(form => {
  if (fs.existsSync(path.join(srcDir, form))) {
    console.log(`  - ${form}`);
  }
});

// Recommendations
console.log(`\n${colors.blue}=== RECOMMENDATIONS ===${colors.reset}`);
console.log(`\n1. Create a unified form component library:`);
console.log(`   - Move all to components/forms/`);
console.log(`   - FormField.tsx (unified field wrapper)`);
console.log(`   - FormInput.tsx`);
console.log(`   - FormSelect.tsx`);
console.log(`   - FormTextarea.tsx`);
console.log(`   - FormSection.tsx`);
console.log(`   - FormValidation.tsx`);

console.log(`\n2. Remove duplicates from:`);
console.log(`   - components/Form/`);
console.log(`   - components/common/Form*`);
console.log(`   - components/Factories/components/FormField.tsx`);

console.log(`\n3. Update imports in all components using forms`);

// Check which components are using form imports
console.log(`\n${colors.yellow}Components using form imports:${colors.reset}`);
const findFormImports = (dir, depth = 0) => {
  if (depth > 3) return;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
      findFormImports(fullPath, depth + 1);
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('FormField') || content.includes('FormInput') || content.includes('FormSelect')) {
        const relativePath = path.relative(srcDir, fullPath);
        if (!relativePath.includes('node_modules')) {
          console.log(`  - ${relativePath}`);
        }
      }
    }
  });
};

// Limit search to specific directories to avoid too many results
['components/Factories', 'components/CustomerModal', 'components/ProjectModal'].forEach(dir => {
  findFormImports(path.join(srcDir, dir));
});