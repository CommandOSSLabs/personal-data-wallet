#!/bin/bash

# Test script for the Personal Data Wallet smart contract

# Ensure we're on testnet
echo "Switching to testnet environment..."
sui client switch --env testnet

echo "Building the contract..."
sui move build --skip-fetch-latest-git-deps

if [ $? -ne 0 ]; then
    echo "Build failed. Exiting."
    exit 1
fi

echo "Publishing the contract..."
PUBLISH_OUTPUT=$(sui client publish --gas-budget 100000000 --skip-fetch-latest-git-deps --json 2>&1)
echo "Publish output: $PUBLISH_OUTPUT"
PACKAGE_ID=$(echo "$PUBLISH_OUTPUT" | grep -o '"packageId":"0x[a-fA-F0-9]*"' | head -1 | cut -d '"' -f 4)

if [ -z "$PACKAGE_ID" ]; then
    echo "Failed to extract package ID. Exiting."
    exit 1
fi

echo "Package published successfully with ID: $PACKAGE_ID"

# Get the current address
ADDRESS=$(sui client active-address)
echo "Using address: $ADDRESS"

echo "Testing chat_sessions::create_session..."
SESSION_TX=$(sui client call --package "$PACKAGE_ID" --module "chat_sessions" --function "create_session" --args "gemini-1.5-pro" --gas-budget 10000000 --json)
SESSION_ID=$(echo "$SESSION_TX" | grep -o '"objectId":"0x[a-fA-F0-9]*"' | head -1 | cut -d '"' -f 4)

if [ -z "$SESSION_ID" ]; then
    echo "Failed to create session. Exiting."
    exit 1
fi

echo "Session created with ID: $SESSION_ID"

echo "Testing chat_sessions::add_message_to_session..."
sui client call --package "$PACKAGE_ID" --module "chat_sessions" --function "add_message_to_session" --args "$SESSION_ID" "user" "Hello, this is a test message" --gas-budget 10000000

echo "Testing chat_sessions::save_session_summary..."
sui client call --package "$PACKAGE_ID" --module "chat_sessions" --function "save_session_summary" --args "$SESSION_ID" "Test session with one user message" --gas-budget 10000000

echo "Testing memory::create_memory_index..."
INDEX_TX=$(sui client call --package "$PACKAGE_ID" --module "memory" --function "create_memory_index" --args "test-index-blob" "test-graph-blob" --gas-budget 10000000 --json)
INDEX_ID=$(echo "$INDEX_TX" | grep -o '"objectId":"0x[a-fA-F0-9]*"' | head -1 | cut -d '"' -f 4)

if [ -z "$INDEX_ID" ]; then
    echo "Failed to create memory index. Exiting."
    exit 1
fi

echo "Memory index created with ID: $INDEX_ID"

echo "Testing memory::update_memory_index..."
sui client call --package "$PACKAGE_ID" --module "memory" --function "update_memory_index" --args "$INDEX_ID" "1" "updated-index-blob" "updated-graph-blob" --gas-budget 10000000

echo "Testing memory::create_memory_record..."
MEMORY_TX=$(sui client call --package "$PACKAGE_ID" --module "memory" --function "create_memory_record" --args "test-category" "42" "test-blob-id" --gas-budget 10000000 --json)
MEMORY_ID=$(echo "$MEMORY_TX" | grep -o '"objectId":"0x[a-fA-F0-9]*"' | head -1 | cut -d '"' -f 4)

if [ -z "$MEMORY_ID" ]; then
    echo "Failed to create memory record. Exiting."
    exit 1
fi

echo "Memory record created with ID: $MEMORY_ID"

echo "All tests completed successfully!"
echo "Contract package ID: $PACKAGE_ID"
echo "Add the following to your .env file:"
echo "SUI_PACKAGE_ID=$PACKAGE_ID"