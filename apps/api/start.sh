#!/bin/sh
set -e

echo "🚀 Starting WorkRight HRIS API..."

# Run migrations if requested (but in background to not block startup)
if [ "$RUN_DB_MIGRATIONS" = "1" ]; then
  echo "📦 Running database migrations in background..."
  (npx prisma migrate deploy && echo "✅ Migrations completed") &
else
  echo "⏭️  Skipping database migrations (RUN_DB_MIGRATIONS != 1)"
fi

# Start the application immediately (don't wait for migrations)
echo "🎯 Starting Node.js application..."
exec node dist/main.js
