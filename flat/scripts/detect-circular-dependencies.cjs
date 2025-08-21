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

// Build dependency graph
function buildDependencyGraph() {
  const graph = new Map();
  const files = findFiles(srcDir);
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const imports = extractImports(content, file);
    graph.set(file, imports);
  });
  
  return graph;
}

// Find all TypeScript/JavaScript files
function findFiles(dir, pattern = /\.(ts|tsx|js|jsx)$/) {
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

// Extract imports from file content
function extractImports(content, currentFile) {
  const imports = new Set();
  const currentDir = path.dirname(currentFile);
  
  // Match various import patterns
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Skip external modules
    if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
      continue;
    }
    
    // Resolve the import path
    let resolvedPath;
    if (importPath.startsWith('@/')) {
      resolvedPath = path.join(srcDir, importPath.replace('@/', ''));
    } else {
      resolvedPath = path.resolve(currentDir, importPath);
    }
    
    // Try to resolve the actual file
    const possiblePaths = [
      resolvedPath + '.ts',
      resolvedPath + '.tsx',
      path.join(resolvedPath, 'index.ts'),
      path.join(resolvedPath, 'index.tsx'),
      resolvedPath // if it already has extension
    ];
    
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        imports.add(possiblePath);
        break;
      }
    }
  }
  
  return Array.from(imports);
}

// Detect circular dependencies using DFS
function detectCircularDependencies(graph) {
  const visited = new Set();
  const recursionStack = new Set();
  const circles = [];
  
  function dfs(node, path = []) {
    if (recursionStack.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) {
        const cycle = path.slice(cycleStart).concat(node);
        circles.push(cycle);
      }
      return;
    }
    
    if (visited.has(node)) {
      return;
    }
    
    visited.add(node);
    recursionStack.add(node);
    
    const dependencies = graph.get(node) || [];
    for (const dep of dependencies) {
      dfs(dep, [...path, node]);
    }
    
    recursionStack.delete(node);
  }
  
  // Start DFS from all nodes
  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }
  
  return circles;
}

// Format path for display
function formatPath(filePath) {
  return path.relative(srcDir, filePath);
}

console.log(`\n${colors.blue}=== DETECTING CIRCULAR DEPENDENCIES ===${colors.reset}\n`);

const graph = buildDependencyGraph();
console.log(`Analyzed ${graph.size} files`);

const circles = detectCircularDependencies(graph);

// Remove duplicate cycles
const uniqueCircles = [];
const seen = new Set();

circles.forEach(cycle => {
  // Normalize the cycle by starting from the "smallest" file
  const normalized = [...cycle].sort();
  const key = normalized.join('->');
  
  if (!seen.has(key)) {
    seen.add(key);
    uniqueCircles.push(cycle);
  }
});

if (uniqueCircles.length === 0) {
  console.log(`\n${colors.green}✓ No circular dependencies found!${colors.reset}`);
} else {
  console.log(`\n${colors.red}✗ Found ${uniqueCircles.length} circular dependencies:${colors.reset}\n`);
  
  uniqueCircles.forEach((cycle, index) => {
    console.log(`${colors.yellow}Circular dependency #${index + 1}:${colors.reset}`);
    cycle.forEach((file, i) => {
      const arrow = i < cycle.length - 1 ? '→' : '↩';
      console.log(`  ${formatPath(file)} ${arrow}`);
    });
    console.log('');
  });
  
  // Provide suggestions
  console.log(`${colors.blue}=== SUGGESTIONS ===${colors.reset}\n`);
  console.log(`1. Extract shared types/interfaces to a separate types file`);
  console.log(`2. Use dynamic imports for non-critical dependencies`);
  console.log(`3. Consider restructuring modules to have clearer boundaries`);
  console.log(`4. Move shared utilities to a common utils folder`);
}

console.log(`\n${colors.green}✓ Analysis complete!${colors.reset}`);