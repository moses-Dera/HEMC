#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting database migrations..."
alembic upgrade head

echo "Running database seeder..."
python seed.py

echo "Starting Uvicorn server..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
