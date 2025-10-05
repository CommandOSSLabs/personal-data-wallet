#!/usr/bin/env sh
set -e

if [ -f dist/db/migrate.js ]; then
  echo "Running database migrations..."
  node dist/db/migrate.js
else
  echo "Warning: dist/db/migrate.js not found; skipping migrations"
fi

echo "Starting PDW chat backend"
exec node dist/server.js
