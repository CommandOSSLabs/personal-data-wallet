#!/bin/bash

# Default values
PORT=3000
SUI_NETWORK="devnet"
PACKAGE_ID_FILE="../sui-data/contract.env"

# Check for package ID file
if [ -f "$PACKAGE_ID_FILE" ]; then
  source $PACKAGE_ID_FILE
  echo "Loaded contract package ID: $SUI_PACKAGE_ID"
else
  echo "Warning: Contract package ID file not found at $PACKAGE_ID_FILE"
  echo "Using default or environment value: $SUI_PACKAGE_ID"
fi

# Start the NestJS server
echo "Starting Personal Data Wallet backend on port $PORT..."
export PORT=$PORT
npm run start:dev