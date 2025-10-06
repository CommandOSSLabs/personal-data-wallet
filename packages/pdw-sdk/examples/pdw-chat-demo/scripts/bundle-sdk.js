#!/usr/bin/env node

/**
 * Bundle SDK script - Creates a self-contained SDK bundle for standalone deployment
 * Works on both Windows and Unix systems
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const CHAT_DEMO_DIR = path.dirname(SCRIPT_DIR);
const SDK_SOURCE_DIR = path.dirname(CHAT_DEMO_DIR);
const BUNDLE_DIR = path.join(CHAT_DEMO_DIR, 'sdk-bundle');

console.log('🚀 Bundling SDK for standalone deployment...');
console.log('📁 Chat Demo Dir:', CHAT_DEMO_DIR);
console.log('📁 SDK Source Dir:', SDK_SOURCE_DIR);
console.log('📁 Bundle Dir:', BUNDLE_DIR);

// List of directories/files to exclude
const EXCLUDE_PATTERNS = [
    'node_modules',
    'dist',
    '.git',
    'examples',
    '.env',
    '.env.local',
    '.env.test',
    'npm-debug.log',
    'yarn-error.log',
    '.DS_Store',
    'Thumbs.db'
];

/**
 * Check if a file/directory should be excluded
 */
function shouldExclude(filePath, basePath) {
    const relativePath = path.relative(basePath, filePath);
    const fileName = path.basename(filePath);

    return EXCLUDE_PATTERNS.some(pattern => {
        if (fileName === pattern) return true;
        if (relativePath.startsWith(pattern)) return true;
        if (fileName.endsWith('.log')) return true;
        return false;
    });
}

/**
 * Recursively copy directory with exclusions
 */
function copyDirectory(source, destination) {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const entries = fs.readdirSync(source, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = path.join(source, entry.name);
        const destinationPath = path.join(destination, entry.name);

        if (shouldExclude(sourcePath, source)) {
            console.log('⏭️  Skipping:', path.relative(SDK_SOURCE_DIR, sourcePath));
            continue;
        }

        if (entry.isDirectory()) {
            copyDirectory(sourcePath, destinationPath);
        } else {
            fs.copyFileSync(sourcePath, destinationPath);
            console.log('📄 Copied:', path.relative(SDK_SOURCE_DIR, sourcePath));
        }
    }
}

/**
 * Update package.json for bundled deployment
 */
function updatePackageJson() {
    const packageJsonPath = path.join(BUNDLE_DIR, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        console.log('⚠️  No package.json found in bundle');
        return;
    }

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Update scripts that might not work in bundle
        if (packageJson.scripts) {
            packageJson.scripts.dev = 'echo "dev mode not available in bundle"';
            if (packageJson.scripts['test:watch']) {
                packageJson.scripts['test:watch'] = 'echo "test watch not available in bundle"';
            }
        }

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('🔧 Updated package.json for bundled deployment');
    } catch (error) {
        console.error('❌ Error updating package.json:', error.message);
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        // Remove existing bundle
        if (fs.existsSync(BUNDLE_DIR)) {
            console.log('🧹 Removing existing SDK bundle...');
            fs.rmSync(BUNDLE_DIR, { recursive: true, force: true });
        }

        // Create bundle directory
        console.log('📦 Creating SDK bundle...');
        fs.mkdirSync(BUNDLE_DIR, { recursive: true });

        // Copy SDK source files
        console.log('📋 Copying SDK source files...');
        copyDirectory(SDK_SOURCE_DIR, BUNDLE_DIR);

        // Update package.json
        updatePackageJson();

        console.log('✅ SDK bundle created successfully!');
        console.log('📊 Bundle contents:');

        const bundleContents = fs.readdirSync(BUNDLE_DIR);
        bundleContents.forEach(item => {
            const itemPath = path.join(BUNDLE_DIR, item);
            const stats = fs.statSync(itemPath);
            const type = stats.isDirectory() ? '📁' : '📄';
            console.log(`${type} ${item}`);
        });

        console.log('');
        console.log('🎯 Next steps:');
        console.log('1. The SDK is now bundled in:', BUNDLE_DIR);
        console.log('2. You can now deploy using: docker build -f Dockerfile.standalone -t pdw-chat-demo .');
        console.log('3. Or deploy to Railway from the chat demo directory');

    } catch (error) {
        console.error('❌ Error bundling SDK:', error.message);
        process.exit(1);
    }
}

// Run the script
main();