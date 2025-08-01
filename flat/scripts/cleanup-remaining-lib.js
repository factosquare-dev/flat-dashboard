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
const libDir = path.join(srcDir, 'lib');

console.log(`\n${colors.blue}=== CLEANING UP REMAINING LIB FILES ===${colors.reset}\n`);

// Check remaining lib/ui-components files
const uiComponentsDir = path.join(libDir, 'ui-components');
const remainingUIComponents = [];

if (fs.existsSync(uiComponentsDir)) {
  const files = fs.readdirSync(uiComponentsDir);
  
  files.forEach(file => {
    const srcPath = path.join(uiComponentsDir, file);
    const baseName = path.basename(file, path.extname(file));
    
    // Check if equivalent exists in components
    const possiblePaths = [
      path.join(srcDir, 'components', 'ui', file),
      path.join(srcDir, 'components', 'common', file),
      path.join(srcDir, 'components', file)
    ];
    
    let found = false;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        found = true;
        console.log(`${colors.yellow}Duplicate found:${colors.reset}`);
        console.log(`  lib: lib/ui-components/${file}`);
        console.log(`  src: ${path.relative(srcDir, p)}`);
        break;
      }
    }
    
    if (!found) {
      remainingUIComponents.push(file);
    }
  });
}

console.log(`\n${colors.green}Unique to lib/ui-components:${colors.reset}`);
remainingUIComponents.forEach(file => {
  console.log(`  ${file}`);
});

// Check react-query
const reactQueryDir = path.join(libDir, 'react-query');
if (fs.existsSync(reactQueryDir)) {
  console.log(`\n${colors.yellow}React Query files in lib:${colors.reset}`);
  const files = fs.readdirSync(reactQueryDir, { recursive: true });
  files.forEach(file => {
    if (!fs.statSync(path.join(reactQueryDir, file)).isDirectory()) {
      console.log(`  lib/react-query/${file}`);
    }
  });
}

// Recommend actions
console.log(`\n${colors.blue}=== RECOMMENDATIONS ===${colors.reset}`);
console.log(`\n1. Move unique UI components to appropriate location:`);
remainingUIComponents.forEach(file => {
  console.log(`   - Move lib/ui-components/${file} to components/ui/${file}`);
});

console.log(`\n2. React Query setup:`);
console.log(`   - Check if react-query is used elsewhere`);
console.log(`   - Consider moving to a proper location or removing if unused`);

console.log(`\n3. Remove empty lib folder after migration`);