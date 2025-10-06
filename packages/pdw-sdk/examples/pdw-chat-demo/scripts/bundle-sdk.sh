#!/bin/bash

# Bundle SDK script - Creates a self-contained SDK bundle for standalone deployment

set -e

echo "🚀 Bundling SDK for standalone deployment..."

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHAT_DEMO_DIR="$(dirname "$SCRIPT_DIR")"
SDK_SOURCE_DIR="$(dirname "$CHAT_DEMO_DIR")"
BUNDLE_DIR="$CHAT_DEMO_DIR/sdk-bundle"

echo "📁 Chat Demo Dir: $CHAT_DEMO_DIR"
echo "📁 SDK Source Dir: $SDK_SOURCE_DIR"
echo "📁 Bundle Dir: $BUNDLE_DIR"

# Remove existing bundle
if [ -d "$BUNDLE_DIR" ]; then
    echo "🧹 Removing existing SDK bundle..."
    rm -rf "$BUNDLE_DIR"
fi

# Create bundle directory
echo "📦 Creating SDK bundle..."
mkdir -p "$BUNDLE_DIR"

# Copy SDK source files (excluding node_modules and dist)
echo "📋 Copying SDK source files..."
rsync -av \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude 'examples' \
    --exclude '*.log' \
    --exclude '.env*' \
    "$SDK_SOURCE_DIR/" "$BUNDLE_DIR/"

# Update package.json to remove local file dependencies
echo "🔧 Updating package.json for bundled deployment..."
if [ -f "$BUNDLE_DIR/package.json" ]; then
    # Create a temporary package.json without dev dependencies that might cause issues
    cat "$BUNDLE_DIR/package.json" | jq '
        .scripts.dev = "echo dev mode not available in bundle" |
        .scripts["test:watch"] = "echo test watch not available in bundle"
    ' > "$BUNDLE_DIR/package.json.tmp" && mv "$BUNDLE_DIR/package.json.tmp" "$BUNDLE_DIR/package.json"
fi

echo "✅ SDK bundle created successfully!"
echo "📊 Bundle contents:"
ls -la "$BUNDLE_DIR"

echo ""
echo "🎯 Next steps:"
echo "1. The SDK is now bundled in: $BUNDLE_DIR"
echo "2. You can now deploy using: docker build -f Dockerfile.standalone -t pdw-chat-demo ."
echo "3. Or deploy to Railway from the chat demo directory"