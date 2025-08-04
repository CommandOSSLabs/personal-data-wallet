#!/bin/bash

echo "==============================================="
echo "Deploying PDW with SEAL Access Control"
echo "==============================================="

# Ensure we're on testnet
echo "Switching to testnet..."
sui client switch --env testnet

# Build the package
echo "Building Move package..."
sui move build --skip-fetch-latest-git-deps

if [ $? -ne 0 ]; then
    echo "Build failed. Exiting."
    exit 1
fi

# Publish the package
echo "Publishing to Sui testnet..."
PUBLISH_OUTPUT=$(sui client publish --gas-budget 200000000 --skip-fetch-latest-git-deps --json 2>&1)

# Extract package ID
PACKAGE_ID=$(echo "$PUBLISH_OUTPUT" | grep -o '"packageId":"0x[a-fA-F0-9]*"' | head -1 | cut -d '"' -f 4)

if [ -z "$PACKAGE_ID" ]; then
    echo "Failed to extract package ID."
    echo "Full output:"
    echo "$PUBLISH_OUTPUT"
    exit 1
fi

echo ""
echo "✅ Contract deployed successfully!"
echo "Package ID: $PACKAGE_ID"
echo ""
echo "Update your backend .env file:"
echo "SUI_PACKAGE_ID=$PACKAGE_ID"
echo ""
echo "SEAL Access Control Functions Available:"
echo "- seal_approve: Standard self-encryption"
echo "- seal_approve_app: App-based access control"
echo "- seal_approve_timelock: Time-based access"
echo "- seal_approve_role: Role-based access"
echo ""
echo "Permission Management Functions:"
echo "- grant_app_permission"
echo "- revoke_app_permission"
echo ""

# Save to file for reference
echo "$PACKAGE_ID" > deployed-package-id.txt
echo "Package ID saved to deployed-package-id.txt"