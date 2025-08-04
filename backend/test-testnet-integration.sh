#!/bin/bash

echo "==============================================="
echo "Personal Data Wallet - Testnet Integration Test"
echo "==============================================="
echo ""
echo "This test will verify:"
echo "1. Sui Testnet connectivity"
echo "2. Seal encryption service"
echo "3. Chat session management on-chain"
echo "4. Memory storage with encryption"
echo "5. Walrus blob storage (if configured)"
echo ""

# Check if backend is running
echo "Checking if backend is running on port 8000..."
curl -s http://localhost:8000 > /dev/null
if [ $? -ne 0 ]; then
    echo "Backend is not running. Starting it now..."
    cd backend && npm run start:dev &
    BACKEND_PID=$!
    echo "Waiting for backend to start (PID: $BACKEND_PID)..."
    sleep 10
else
    echo "Backend is already running."
fi

# Run the integration test
echo ""
echo "Running integration tests..."
echo "================================"
cd backend && npm run test:e2e -- test/full-integration.e2e-spec.ts --verbose

# If we started the backend, stop it
if [ ! -z "$BACKEND_PID" ]; then
    echo ""
    echo "Stopping backend..."
    kill $BACKEND_PID
fi

echo ""
echo "Test completed!"