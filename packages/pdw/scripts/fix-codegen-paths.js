#!/usr/bin/env node

/**
 * Fix Windows path separator issues in generated TypeScript files
 * This script ensures proper import paths for Windows development environment
 */

const fs = require('fs');
const path = require('path');

const GENERATED_DIR = path.join(__dirname, '../src/generated');

/**
 * Recursively find all TypeScript files in a directory
 */
function findTsFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Generated directory not found: ${dir}`);
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...findTsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Fix import paths in a TypeScript file
 */
function fixImportPaths(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix common import path issues
    let newContent = content
      // Fix ~root/ imports to relative paths
      .replace(/from '~root\//g, "from '../")
      // Fix Windows backslashes in imports
      .replace(/from ['"]([^'"]+)\\([^'"]+)['"]/g, "from '$1/$2'")
      // Fix double slashes
      .replace(/\/\//g, '/')
      // Ensure .js extensions for relative imports
      .replace(/from ['"](\.[^'"]+)(?<!\.js)['"]/g, "from '$1.js'");
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      modified = true;
    }
    
    return modified;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Fixing Windows path separators in generated files...');
  
  const tsFiles = findTsFiles(GENERATED_DIR);
  
  if (tsFiles.length === 0) {
    console.log('⚪ No TypeScript files found in generated directory');
    return;
  }
  
  let fixedCount = 0;
  
  for (const file of tsFiles) {
    const relativePath = path.relative(process.cwd(), file);
    const wasFixed = fixImportPaths(file);
    
    if (wasFixed) {
      console.log(`  ✅ Fixed: ${relativePath}`);
      fixedCount++;
    } else {
      console.log(`  ⚪ No changes needed: ${relativePath}`);
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} files with Windows path separator issues\n`);
  
  if (fixedCount > 0) {
    console.log('✅ Path separator fixes applied successfully!');
  } else {
    console.log('⚪ No fixes needed');
  }
}

// Run the script
main();