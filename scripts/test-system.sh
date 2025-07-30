#!/bin/bash

# Test script for Personal Data Wallet
# This script tests the basic functionality of the system

set -e

echo "🧪 Testing Personal Data Wallet System"
echo "======================================="

# Configuration
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"
USER_ID="test-user-$(date +%s)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test 1: Check if services are running
echo "1. Checking if services are running..."

if curl -s "$BACKEND_URL/health" > /dev/null; then
    log_info "Backend is running"
else
    log_error "Backend is not responding"
    exit 1
fi

if curl -s "$FRONTEND_URL" > /dev/null; then
    log_info "Frontend is running"
else
    log_warn "Frontend is not responding (this is OK if running backend-only)"
fi

# Test 2: Test health endpoint
echo -e "\n2. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    log_info "Health check passed: $HEALTH_RESPONSE"
else
    log_error "Health check failed: $HEALTH_RESPONSE"
    exit 1
fi

# Test 3: Test fact ingestion
echo -e "\n3. Testing fact ingestion..."
INGEST_RESPONSE=$(curl -s -X POST "$BACKEND_URL/ingest" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"My flight to Tokyo is on Tuesday at 8 AM\", \"user_id\": \"$USER_ID\"}")

if echo "$INGEST_RESPONSE" | grep -q "success.*true"; then
    log_info "Fact ingestion successful"
    echo "Response: $INGEST_RESPONSE"
else
    log_error "Fact ingestion failed"
    echo "Response: $INGEST_RESPONSE"
    exit 1
fi

# Test 4: Test another fact
echo -e "\n4. Testing second fact ingestion..."
INGEST_RESPONSE2=$(curl -s -X POST "$BACKEND_URL/ingest" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"I work at OpenAI as a software engineer\", \"user_id\": \"$USER_ID\"}")

if echo "$INGEST_RESPONSE2" | grep -q "success.*true"; then
    log_info "Second fact ingestion successful"
else
    log_error "Second fact ingestion failed"
    echo "Response: $INGEST_RESPONSE2"
fi

# Test 5: Test query functionality
echo -e "\n5. Testing query functionality..."
QUERY_RESPONSE=$(curl -s -X POST "$BACKEND_URL/query" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"When is my flight?\", \"user_id\": \"$USER_ID\"}")

if echo "$QUERY_RESPONSE" | grep -q "success.*true"; then
    log_info "Query successful"
    echo "Response: $QUERY_RESPONSE"
else
    log_error "Query failed"
    echo "Response: $QUERY_RESPONSE"
fi

# Test 6: Test memory stats
echo -e "\n6. Testing memory stats..."
STATS_RESPONSE=$(curl -s "$BACKEND_URL/memory/$USER_ID/stats")

if echo "$STATS_RESPONSE" | grep -q "user_id"; then
    log_info "Memory stats retrieved successfully"
    echo "Stats: $STATS_RESPONSE"
else
    log_error "Memory stats retrieval failed"
    echo "Response: $STATS_RESPONSE"
fi

# Test 7: Test conversational input
echo -e "\n7. Testing conversational input..."
CONV_RESPONSE=$(curl -s -X POST "$BACKEND_URL/ingest" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"Hello, how are you?\", \"user_id\": \"$USER_ID\"}")

if echo "$CONV_RESPONSE" | grep -q "CONVERSATIONAL"; then
    log_info "Conversational classification working"
else
    log_warn "Conversational classification may need adjustment"
    echo "Response: $CONV_RESPONSE"
fi

# Test 8: Test query classification
echo -e "\n8. Testing query classification..."
QUERY_CLASS_RESPONSE=$(curl -s -X POST "$BACKEND_URL/ingest" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"What time is my meeting?\", \"user_id\": \"$USER_ID\"}")

if echo "$QUERY_CLASS_RESPONSE" | grep -q "QUERY"; then
    log_info "Query classification working"
else
    log_warn "Query classification may need adjustment"
    echo "Response: $QUERY_CLASS_RESPONSE"
fi

# Performance test
echo -e "\n9. Running basic performance test..."
start_time=$(date +%s%N)
for i in {1..5}; do
    curl -s -X POST "$BACKEND_URL/ingest" \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"Test fact number $i\", \"user_id\": \"$USER_ID\"}" > /dev/null
done
end_time=$(date +%s%N)
duration=$(( (end_time - start_time) / 1000000 ))

log_info "Processed 5 requests in ${duration}ms (avg: $((duration / 5))ms per request)"

echo -e "\n🎉 All tests completed!"
echo "======================================="
echo "Test summary:"
echo "- User ID used: $USER_ID"
echo "- Backend URL: $BACKEND_URL"
echo "- Frontend URL: $FRONTEND_URL"
echo ""
echo "To clean up test data, you can check the backend/data/ directory"
echo "and remove files related to user: $USER_ID"