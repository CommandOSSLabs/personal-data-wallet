#!/bin/bash

# Seal Service Testnet Configuration Script

echo "🔧 Configuring Seal Service for Testnet"
echo "======================================"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
fi

echo ""
echo "📋 Current Configuration:"
echo "------------------------"
grep -E "^(SUI_NETWORK|SEAL_THRESHOLD|SEAL_KEY_SERVER)" .env || echo "No Seal configuration found"

echo ""
echo "🔍 Available Configuration Options:"
echo ""
echo "1. 1-out-of-1 (Single key server, less secure but simpler)"
echo "   SEAL_THRESHOLD=1"
echo "   SEAL_KEY_SERVER_1=<server_id>"
echo ""
echo "2. 1-out-of-2 (Two servers, need only one to decrypt)"
echo "   SEAL_THRESHOLD=1"
echo "   SEAL_KEY_SERVER_1=<server_id_1>"
echo "   SEAL_KEY_SERVER_2=<server_id_2>"
echo ""
echo "3. 2-out-of-2 (Two servers, need both to decrypt - more secure)"
echo "   SEAL_THRESHOLD=2"
echo "   SEAL_KEY_SERVER_1=<server_id_1>"
echo "   SEAL_KEY_SERVER_2=<server_id_2>"

echo ""
echo "⚠️  NOTE: Testnet key server IDs are not publicly documented yet."
echo "You need to:"
echo "1. Join Sui Discord: https://discord.gg/sui"
echo "2. Ask for testnet key server IDs in #seal channel"
echo "3. Update the SEAL_KEY_SERVER_* values in .env"

echo ""
echo "🚀 For now, run in development mode:"
echo "npm run build && npm start"

echo ""
echo "🔍 To search for key servers:"
echo "npm run find-servers"