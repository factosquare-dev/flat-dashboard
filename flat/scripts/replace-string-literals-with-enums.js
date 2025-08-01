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

// Define replacements for string literals to enums
const replacements = [
  // Button variants
  { 
    pattern: /variant=["']primary["']/g, 
    replacement: 'variant={ButtonVariant.PRIMARY}',
    importNeeded: 'ButtonVariant'
  },
  { 
    pattern: /variant=["']secondary["']/g, 
    replacement: 'variant={ButtonVariant.SECONDARY}',
    importNeeded: 'ButtonVariant'
  },
  { 
    pattern: /variant=["']danger["']/g, 
    replacement: 'variant={ButtonVariant.DANGER}',
    importNeeded: 'ButtonVariant'
  },
  { 
    pattern: /variant=["']success["']/g, 
    replacement: 'variant={ButtonVariant.SUCCESS}',
    importNeeded: 'ButtonVariant'
  },
  { 
    pattern: /variant=["']warning["']/g, 
    replacement: 'variant={ButtonVariant.WARNING}',
    importNeeded: 'ButtonVariant'
  },
  
  // Modal sizes
  { 
    pattern: /size=["']sm["']/gi, 
    replacement: 'size={ModalSize.SM}',
    importNeeded: 'ModalSize'
  },
  { 
    pattern: /size=["']md["']/gi, 
    replacement: 'size={ModalSize.MD}',
    importNeeded: 'ModalSize'
  },
  { 
    pattern: /size=["']lg["']/gi, 
    replacement: 'size={ModalSize.LG}',
    importNeeded: 'ModalSize'
  },
  { 
    pattern: /size=["']xl["']/gi, 
    replacement: 'size={ModalSize.XL}',
    importNeeded: 'ModalSize'
  },
  { 
    pattern: /size=["']small["']/gi, 
    replacement: 'size={ModalSize.SM}',
    importNeeded: 'ModalSize'
  },
  { 
    pattern: /size=["']medium["']/gi, 
    replacement: 'size={ModalSize.MD}',
    importNeeded: 'ModalSize'
  },
  { 
    pattern: /size=["']large["']/gi, 
    replacement: 'size={ModalSize.LG}',
    importNeeded: 'ModalSize'
  },
];

// Find all TypeScript/JavaScript files
function findFiles(dir, pattern = /\.(tsx?)$/) {
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

// Check if import already exists
function hasImport(content, enumName) {
  const importRegex = new RegExp(`import.*{[^}]*${enumName}[^}]*}.*from.*['"].*types/enums['"]`);
  return importRegex.test(content);
}

// Add import to file
function addImport(content, enumNames) {
  const uniqueEnums = [...new Set(enumNames)];
  const importStatement = `import { ${uniqueEnums.join(', ')} } from '@/types/enums';`;
  
  // Find the last import statement
  const importRegex = /^import\s+.*$/gm;
  const imports = content.match(importRegex);
  
  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertPosition = lastImportIndex + lastImport.length;
    
    return content.slice(0, insertPosition) + '\n' + importStatement + content.slice(insertPosition);
  } else {
    // No imports found, add at the beginning
    return importStatement + '\n\n' + content;
  }
}

console.log(`\n${colors.blue}=== REPLACING STRING LITERALS WITH ENUMS ===${colors.reset}\n`);

const files = findFiles(srcDir);
console.log(`Found ${files.length} TypeScript files to check`);

let updatedCount = 0;
const updatedFiles = [];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  const enumsNeeded = new Set();
  
  replacements.forEach(({ pattern, replacement, importNeeded }) => {
    const before = content;
    content = content.replace(pattern, replacement);
    if (before !== content) {
      modified = true;
      if (importNeeded) {
        enumsNeeded.add(importNeeded);
      }
    }
  });
  
  if (modified) {
    // Check which enums need to be imported
    const enumsToImport = [];
    enumsNeeded.forEach(enumName => {
      if (!hasImport(content, enumName)) {
        enumsToImport.push(enumName);
      }
    });
    
    // Add imports if needed
    if (enumsToImport.length > 0) {
      content = addImport(content, enumsToImport);
    }
    
    fs.writeFileSync(file, content);
    updatedCount++;
    const relativePath = path.relative(srcDir, file);
    updatedFiles.push(relativePath);
    console.log(`  ${colors.green}✓${colors.reset} ${relativePath}`);
  }
});

console.log(`\n${colors.green}Updated ${updatedCount} files${colors.reset}`);

// Summary
console.log(`\n${colors.blue}=== SUMMARY ===${colors.reset}`);
console.log(`\n1. Replaced string literals with enums:`);
console.log(`   - Button variants: 'primary' → ButtonVariant.PRIMARY`);
console.log(`   - Button variants: 'secondary' → ButtonVariant.SECONDARY`);
console.log(`   - Button variants: 'danger' → ButtonVariant.DANGER`);
console.log(`   - Modal sizes: 'sm' → ModalSize.SM`);
console.log(`   - Modal sizes: 'md' → ModalSize.MD`);
console.log(`   - Modal sizes: 'lg' → ModalSize.LG`);
console.log(`   - Modal sizes: 'xl' → ModalSize.XL`);

console.log(`\n2. Added necessary imports from '@/types/enums'`);

console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
console.log(`1. Run 'npm run typecheck' to ensure all types are correct`);
console.log(`2. Test the application to ensure functionality is unchanged`);
console.log(`3. Consider adding more enum replacements for other string literals`);

console.log(`\n${colors.green}✓ String literal replacement complete!${colors.reset}`);