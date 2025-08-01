#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'src');

// Files to update and their replacements
const replacements = [
  {
    old: /from ['"]\.\.?\/utils\/globalState['"]/g,
    new: `from '@/utils/schedule/globalState'`
  },
  {
    old: /from ['"]\.\.?\/\.\.?\/utils\/globalState['"]/g,
    new: `from '@/utils/schedule/globalState'`
  },
  {
    old: /from ['"]\.\.?\/utils\/dragCalculations['"]/g,
    new: `from '@/utils/schedule/dragCalculations'`
  },
  {
    old: /from ['"]\.\.?\/\.\.?\/utils\/dragCalculations['"]/g,
    new: `from '@/utils/schedule/dragCalculations'`
  }
];

// Find all TypeScript/JavaScript files in Schedule component
function findFiles(dir, pattern = /\.(ts|tsx|js|jsx)$/) {
  const files = [];
  
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
  
  return files;
}

const scheduleDir = path.join(srcDir, 'components', 'Schedule');
const files = findFiles(scheduleDir);

console.log(`Updating imports in ${files.length} files...`);

let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  replacements.forEach(({ old, new: newImport }) => {
    if (old.test(content)) {
      content = content.replace(old, newImport);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(file, content);
    updatedCount++;
    console.log(`Updated: ${path.relative(srcDir, file)}`);
  }
});

console.log(`\nUpdated ${updatedCount} files.`);