#!/bin/bash

echo "Installing test dependencies..."
npm install --save-dev node-fetch@2.6.7 eventsource@2.0.2

echo "Dependencies installed, you can now run:"
echo "  node test-sse.js"