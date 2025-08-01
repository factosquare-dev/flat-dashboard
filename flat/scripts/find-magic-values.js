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

// Magic values to find
const magicNumbers = [];
const magicStrings = [];
const timeoutDelays = [];
const gridCalculations = [];
const apiEndpoints = [];
const cssConstants = [];

// Find all TypeScript/JavaScript files
function findFiles(dir, pattern = /\.(ts|tsx)$/) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== '__tests__') {
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

// Analyze file for magic values
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(srcDir, filePath);
  
  // Skip test files and constants files
  if (relativePath.includes('test') || relativePath.includes('constants')) {
    return;
  }
  
  // Find magic numbers (excluding 0, 1, -1, common CSS values)
  const numberRegex = /(?<![a-zA-Z])\b(\d+)\b(?![a-zA-Z])/g;
  let match;
  
  while ((match = numberRegex.exec(content)) !== null) {
    const number = parseInt(match[1]);
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const line = content.split('\n')[lineNumber - 1];
    
    // Skip common values and CSS-like values
    if (number <= 1 || number === 100 || number === 0) continue;
    if (line.includes('px') || line.includes('rem') || line.includes('vh') || line.includes('vw')) {
      cssConstants.push({ file: relativePath, line: lineNumber, value: number, context: line.trim() });
      continue;
    }
    
    // Check for timeouts/delays
    if (line.includes('setTimeout') || line.includes('setInterval') || line.includes('delay') || line.includes('timeout')) {
      timeoutDelays.push({ file: relativePath, line: lineNumber, value: number, context: line.trim() });
    }
    // Check for grid calculations
    else if (line.includes('grid') || line.includes('col') || line.includes('row') || line.includes('width') || line.includes('height')) {
      gridCalculations.push({ file: relativePath, line: lineNumber, value: number, context: line.trim() });
    }
    // Other magic numbers
    else if (number > 1) {
      magicNumbers.push({ file: relativePath, line: lineNumber, value: number, context: line.trim() });
    }
  }
  
  // Find magic strings (API endpoints, repeated strings)
  const stringRegex = /['"]([^'"]{4,50})['"]/g;
  const stringCounts = new Map();
  
  while ((match = stringRegex.exec(content)) !== null) {
    const str = match[1];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const line = content.split('\n')[lineNumber - 1];
    
    // Skip import statements, type definitions, and common strings
    if (line.includes('import') || line.includes('export') || line.includes('interface') || line.includes('type ')) continue;
    if (['string', 'number', 'boolean', 'object', 'function', 'undefined', 'null'].includes(str)) continue;
    
    // Check for API endpoints
    if (str.includes('/api/') || str.includes('http') || str.startsWith('/')) {
      if (str.startsWith('/') && str.length > 1) {
        apiEndpoints.push({ file: relativePath, line: lineNumber, value: str, context: line.trim() });
      }
    }
    
    // Track string occurrences
    const count = stringCounts.get(str) || 0;
    stringCounts.set(str, count + 1);
  }
  
  // Find repeated strings (used 3+ times)
  stringCounts.forEach((count, str) => {
    if (count >= 3) {
      magicStrings.push({ file: relativePath, value: str, count });
    }
  });
}

console.log(`\n${colors.blue}=== FINDING MAGIC VALUES ===${colors.reset}\n`);

const files = findFiles(srcDir);
console.log(`Analyzing ${files.length} files...\n`);

files.forEach(analyzeFile);

// Display results
console.log(`${colors.yellow}=== TIMEOUTS/DELAYS ===${colors.reset}`);
timeoutDelays.slice(0, 10).forEach(({ file, line, value, context }) => {
  console.log(`  ${file}:${line} - ${value}ms`);
  console.log(`    ${colors.gray}${context}${colors.reset}`);
});
if (timeoutDelays.length > 10) {
  console.log(`  ... and ${timeoutDelays.length - 10} more`);
}

console.log(`\n${colors.yellow}=== GRID/LAYOUT CALCULATIONS ===${colors.reset}`);
gridCalculations.slice(0, 10).forEach(({ file, line, value, context }) => {
  console.log(`  ${file}:${line} - ${value}`);
  console.log(`    ${colors.gray}${context}${colors.reset}`);
});
if (gridCalculations.length > 10) {
  console.log(`  ... and ${gridCalculations.length - 10} more`);
}

console.log(`\n${colors.yellow}=== API ENDPOINTS ===${colors.reset}`);
const uniqueEndpoints = [...new Set(apiEndpoints.map(e => e.value))];
uniqueEndpoints.slice(0, 10).forEach(endpoint => {
  console.log(`  "${endpoint}"`);
});
if (uniqueEndpoints.length > 10) {
  console.log(`  ... and ${uniqueEndpoints.length - 10} more`);
}

console.log(`\n${colors.yellow}=== REPEATED STRINGS ===${colors.reset}`);
magicStrings.slice(0, 10).forEach(({ value, count }) => {
  console.log(`  "${value}" - used ${count} times`);
});
if (magicStrings.length > 10) {
  console.log(`  ... and ${magicStrings.length - 10} more`);
}

// Summary
console.log(`\n${colors.blue}=== SUMMARY ===${colors.reset}`);
console.log(`Found ${timeoutDelays.length} timeout/delay values`);
console.log(`Found ${gridCalculations.length} grid/layout calculations`);
console.log(`Found ${uniqueEndpoints.length} unique API endpoints`);
console.log(`Found ${magicStrings.length} repeated strings`);
console.log(`Found ${cssConstants.length} CSS-related constants`);

console.log(`\n${colors.green}✓ Analysis complete!${colors.reset}`);