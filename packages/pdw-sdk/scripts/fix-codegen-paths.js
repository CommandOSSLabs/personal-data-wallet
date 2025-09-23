#!/usr/bin/env node
/**
 * Fix Windows Path Separators in Generated Files
 * 
 * This script fixes the Windows path separator issues in generated Move contract files
 * that occur when running sui-ts-codegen on Windows systems.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixPathSeparators() {
  console.log('🔧 Fixing Windows path separators in generated files...');
  
  // Find all TypeScript files in the generated directory
  const files = glob.sync('src/generated/**/*.ts');
  
  let fixCount = 0;
  
  files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const originalContent = content;
    
    // Fix 1: Windows backslashes in imports '..\utils\index.js' -> forward slashes
    if (content.includes("'..\\utils\\index.js'")) {
      if (filePath.includes('deps/sui/') || filePath.includes('deps\\sui\\')) {
        // For files in deps/sui/, they need ../../../utils/index.js
        content = content.replace(/from '\.\.\\\\utils\\\\index\.js'/g, "from '../../../utils/index.js'");
      } else {
        // For files in pdw/, they need ../utils/index.js  
        content = content.replace(/from '\.\.\\\\utils\\\\index\.js'/g, "from '../utils/index.js'");
      }
      modified = true;
    }
    
    // Fix 2: ~root Windows paths '~root\deps\sui\...' -> forward slashes
    if (content.includes('~root\\\\deps\\\\')) {
      content = content.replace(/~root\\\\deps\\\\sui\\\\(\w+)\.js/g, '~root/deps/sui/$1.js');
      modified = true;
    }
    
    // Fix 3: Any remaining Windows backslashes in import paths
    const backslashImportPattern = /from '[^']*\\[^']*'/g;
    if (backslashImportPattern.test(content)) {
      content = content.replace(backslashImportPattern, (match) => {
        return match.replace(/\\/g, '/');
      });
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      fixCount++;
    } else {
      console.log(`  ⚪ No changes needed: ${path.relative(process.cwd(), filePath)}`);
    }
  });
  
  console.log(`\n🎉 Fixed ${fixCount} files with Windows path separator issues`);
  return fixCount > 0;
}

// Run if called directly
if (require.main === module) {
  const hasChanges = fixPathSeparators();
  console.log(hasChanges ? '\n✅ Path separator fixes applied successfully!' : '\n⚪ No fixes needed');
  process.exit(0);
}

module.exports = { fixPathSeparators };