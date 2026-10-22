#!/bin/bash

echo "Starting database migrations..."
if alembic upgrade head; then
    echo "✓ Database migrations completed successfully."
else
    echo "⚠️ Warning: Database migrations failed (check DATABASE_URL / Supabase status). Starting Uvicorn to keep server and /health operational..."
fi

echo "Running database seeder..."
if python seed.py; then
    echo "✓ Database seeding completed successfully."
else
    echo "⚠️ Warning: Database seeding could not run. Continuing to start server..."
fi

echo "Starting Uvicorn server..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
