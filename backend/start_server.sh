#!/bin/bash

# Script to start the backend server with the correct Python environment
# This ensures we use the right Python and packages

# Kill any existing server on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Start the server with explicit Python path
/opt/homebrew/bin/python3.11 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload