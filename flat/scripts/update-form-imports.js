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

// Define import replacements
const replacements = [
  // Form component imports
  { pattern: /from ['"]\.\.?\/Form['"]|from ['"]\.\/components\/Form['"]/g, replacement: `from '@/components/forms'` },
  { pattern: /from ['"]\.\.?\/forms['"]|from ['"]\.\/forms['"]/g, replacement: `from '@/components/forms'` },
  { pattern: /from ['"]\.\.\/common\/(FormInput|FormSelect|FormTextarea|FormGroup|ValidationMessage)['"]/g, replacement: `from '@/components/forms'` },
  { pattern: /from ['"]\.\.\/\.\.\/common\/(FormInput|FormSelect|FormTextarea|FormGroup|ValidationMessage)['"]/g, replacement: `from '@/components/forms'` },
  { pattern: /from ['"]\.\/components\/(FormField)['"]/g, replacement: `from '@/components/forms'` },
  
  // Specific paths
  { pattern: /from ['"]@\/components\/Form['"]/g, replacement: `from '@/components/forms'` },
  { pattern: /from ['"]@\/components\/common\/Form['"]/g, replacement: `from '@/components/forms'` },
  { pattern: /from ['"]@\/components\/Factories\/components\/FormField['"]/g, replacement: `from '@/components/forms'` },
  
  // Additional patterns for common form component imports
  { pattern: /from ['"]@\/components\/common\/(FormInput|FormSelect|FormTextarea|FormGroup)['"]/g, replacement: `from '@/components/forms'` },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/common\/(FormInput|FormSelect|FormTextarea|FormGroup|ValidationMessage)['"]/g, replacement: `from '@/components/forms'` },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/common\/(FormInput|FormSelect|FormTextarea|FormGroup|ValidationMessage)['"]/g, replacement: `from '@/components/forms'` },
  
  // More relative path patterns
  { pattern: /from ['"]\.\.\/\.\.\/components\/common\/(FormInput|FormSelect|FormTextarea|FormGroup)['"]/g, replacement: `from '@/components/forms'` },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/components\/common\/(FormInput|FormSelect|FormTextarea|FormGroup)['"]/g, replacement: `from '@/components/forms'` },
];

// Find all TypeScript/JavaScript files
function findFiles(dir, pattern = /\.(ts|tsx|js|jsx)$/) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'forms') {
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

console.log(`\n${colors.blue}=== UPDATING FORM IMPORTS ===${colors.reset}\n`);

const files = findFiles(srcDir);
console.log(`Found ${files.length} files to check`);

let updatedCount = 0;
const updatedFiles = [];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Check if file contains form imports
  if (content.includes('FormField') || content.includes('FormInput') || 
      content.includes('FormSelect') || content.includes('FormTextarea') ||
      content.includes('FormGroup') || content.includes('ValidationMessage')) {
    
    replacements.forEach(({ pattern, replacement }) => {
      const before = content;
      content = content.replace(pattern, replacement);
      if (before !== content) {
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(file, content);
      updatedCount++;
      const relativePath = path.relative(srcDir, file);
      updatedFiles.push(relativePath);
      console.log(`  ${colors.green}✓${colors.reset} ${relativePath}`);
    }
  }
});

console.log(`\n${colors.green}Updated ${updatedCount} files${colors.reset}`);

// Show files that might need manual review
console.log(`\n${colors.yellow}Files to review manually:${colors.reset}`);
const reviewPatterns = [
  'CustomerModal',
  'ProjectModal',
  'FactoryModal',
  'Factories/components'
];

updatedFiles.forEach(file => {
  if (reviewPatterns.some(pattern => file.includes(pattern))) {
    console.log(`  - ${file}`);
  }
});

// Cleanup recommendations
console.log(`\n${colors.blue}=== NEXT STEPS ===${colors.reset}`);
console.log(`\n1. Test the application to ensure forms work correctly`);
console.log(`\n2. If everything works, remove old form directories:`);
console.log(`   ${colors.red}rm -rf src/components/Form${colors.reset}`);
console.log(`   ${colors.red}rm -rf src/components/common/Form*${colors.reset}`);
console.log(`   ${colors.red}rm -f src/components/common/ValidationMessage.tsx${colors.reset}`);
console.log(`   ${colors.red}rm -f src/components/Factories/components/FormField.*${colors.reset}`);

console.log(`\n${colors.green}✓ Import updates complete!${colors.reset}`);