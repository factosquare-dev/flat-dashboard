#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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

// Get file hash
function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}

// Recursively get all files in a directory
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

// Compare files in lib vs src
function findDuplicates() {
  const srcDir = path.join(__dirname, '..', 'src');
  const libDir = path.join(srcDir, 'lib');
  
  if (!fs.existsSync(libDir)) {
    console.log(`${colors.red}No lib directory found${colors.reset}`);
    return;
  }

  const libFiles = getAllFiles(libDir);
  const srcFiles = getAllFiles(srcDir).filter(f => !f.startsWith(libDir));

  const duplicates = {
    exact: [],
    similar: [],
    unique: []
  };

  const fileMap = new Map();

  // Build map of src files
  srcFiles.forEach(file => {
    const relativePath = path.relative(srcDir, file);
    const fileName = path.basename(file);
    const hash = getFileHash(file);
    
    if (!fileMap.has(fileName)) {
      fileMap.set(fileName, []);
    }
    fileMap.get(fileName).push({ path: file, relativePath, hash });
  });

  // Check lib files against src files
  libFiles.forEach(libFile => {
    const libRelativePath = path.relative(libDir, libFile);
    const fileName = path.basename(libFile);
    const libHash = getFileHash(libFile);
    
    if (fileMap.has(fileName)) {
      const matches = fileMap.get(fileName);
      let foundExact = false;
      
      matches.forEach(srcFile => {
        if (srcFile.hash === libHash) {
          duplicates.exact.push({
            lib: libRelativePath,
            src: srcFile.relativePath,
            fileName
          });
          foundExact = true;
        }
      });
      
      if (!foundExact) {
        duplicates.similar.push({
          lib: libRelativePath,
          fileName,
          potentialMatches: matches.map(m => m.relativePath)
        });
      }
    } else {
      duplicates.unique.push(libRelativePath);
    }
  });

  // Print results
  console.log(`\n${colors.blue}=== DUPLICATE FILE ANALYSIS ===${colors.reset}\n`);
  
  console.log(`${colors.red}EXACT DUPLICATES (${duplicates.exact.length} files):${colors.reset}`);
  duplicates.exact.forEach(dup => {
    console.log(`  ${colors.yellow}${dup.fileName}${colors.reset}`);
    console.log(`    lib: ${dup.lib}`);
    console.log(`    src: ${dup.src}`);
  });
  
  console.log(`\n${colors.yellow}SIMILAR FILES (${duplicates.similar.length} files):${colors.reset}`);
  duplicates.similar.slice(0, 10).forEach(dup => {
    console.log(`  ${colors.yellow}${dup.fileName}${colors.reset}`);
    console.log(`    lib: ${dup.lib}`);
    console.log(`    potential matches: ${dup.potentialMatches.join(', ')}`);
  });
  if (duplicates.similar.length > 10) {
    console.log(`  ... and ${duplicates.similar.length - 10} more`);
  }
  
  console.log(`\n${colors.green}UNIQUE TO LIB (${duplicates.unique.length} files):${colors.reset}`);
  duplicates.unique.slice(0, 10).forEach(file => {
    console.log(`  ${file}`);
  });
  if (duplicates.unique.length > 10) {
    console.log(`  ... and ${duplicates.unique.length - 10} more`);
  }

  // Summary
  console.log(`\n${colors.blue}=== SUMMARY ===${colors.reset}`);
  console.log(`Total lib files: ${libFiles.length}`);
  console.log(`Exact duplicates: ${duplicates.exact.length}`);
  console.log(`Similar files: ${duplicates.similar.length}`);
  console.log(`Unique to lib: ${duplicates.unique.length}`);
  
  const duplicatePercentage = ((duplicates.exact.length / libFiles.length) * 100).toFixed(1);
  console.log(`\n${colors.red}${duplicatePercentage}% of lib files are exact duplicates!${colors.reset}`);
}

findDuplicates();