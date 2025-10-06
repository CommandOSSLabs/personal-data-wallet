#!/usr/bin/env sh
set -e

echo "=== PDW Chat Backend Startup ==="
echo "Node.js version: $(node --version)"
echo "Working directory: $(pwd)"
echo "NODE_ENV: ${NODE_ENV:-not set}"
echo "DATABASE_URL: ${DATABASE_URL:+***configured***}"

# Function to check if database is accessible
check_database() {
  echo "Checking database connectivity..."
  if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set"
    exit 1
  fi

  # Try to connect to database with a simple query
  if ! node -e "
    const { Client } = require('pg');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    client.connect()
      .then(() => client.query('SELECT 1'))
      .then(() => client.end())
      .then(() => console.log('Database connection successful'))
      .catch(err => {
        console.error('Database connection failed:', err.message);
        process.exit(1);
      });
  " 2>/dev/null; then
    echo "Database connection failed, retrying in 5 seconds..."
    sleep 5
    check_database
  fi
}

# Check database connectivity first
check_database

# Run migrations
echo "Checking for database migrations..."
if [ -f dist/db/migrate.js ]; then
  echo "Running database migrations..."
  if ! node dist/db/migrate.js; then
    echo "ERROR: Database migrations failed"
    exit 1
  fi
  echo "Database migrations completed successfully"
else
  echo "Warning: dist/db/migrate.js not found; skipping migrations"
  echo "Contents of dist/db/:"
  ls -la dist/db/ || echo "dist/db/ directory not found"
fi

# Create storage directories if they don't exist
echo "Creating storage directories..."
mkdir -p /app/storage/consents
echo "Storage directories created successfully"

# Verify required files exist
echo "Verifying server files..."
if [ ! -f dist/server.js ]; then
  echo "ERROR: dist/server.js not found"
  echo "Contents of dist/:"
  ls -la dist/ || echo "dist/ directory not found"
  exit 1
fi

# Check critical environment variables
echo "Validating environment variables..."
required_vars="SUI_RPC_URL PDW_PACKAGE_ID PDW_ACCESS_REGISTRY_ID GEMINI_API_KEY"
for var in $required_vars; do
  eval value=\$${var}
  if [ -z "$value" ]; then
    echo "ERROR: Required environment variable $var is not set"
    exit 1
  fi
  echo "✓ $var is configured"
done

echo "=== Starting PDW Chat Backend Server ==="
exec node dist/server.js
