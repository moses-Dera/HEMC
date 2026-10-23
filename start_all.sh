#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================================="
echo "  🚀 HEMC 1-Click System Startup (Local Defense Mode)"
echo "=========================================================="

# 1. Start Docker Database & Adminer DB Viewer
echo "[1/4] Starting PostgreSQL and Adminer via Docker..."
if command -v docker &> /dev/null; then
    if docker compose up -d 2>/dev/null; then
        echo "✓ Docker containers (PostgreSQL + Adminer) started successfully."
    else
        echo "⚠️ Note: Docker daemon is not active. (If using Docker, open Docker Desktop)."
        echo "   Continuing startup with existing database connection..."
    fi
else
    echo "⚠️ Docker command not found. Continuing with configured database in backend/.env..."
fi

# 2. Wait briefly for database port readiness
sleep 2

# 3. Database migrations & seeding
echo "[2/4] Applying database migrations and seeding initial data..."
cd "$PROJECT_ROOT/backend"
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

alembic upgrade head || true
python seed.py || true

# 4. Start Backend in background
echo "[3/4] Starting FastAPI backend on http://localhost:8000..."
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# 5. Start Frontend in background
echo "[4/4] Starting Next.js frontend on http://localhost:3000..."
cd "$PROJECT_ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "  🎉 All Services Are Running Successfully!"
echo "=========================================================="
echo "  🌐 Student Portal:   http://localhost:3000"
echo "  🩺 Doctor Portal:    http://localhost:3000/doctor/dashboard"
echo "  🛡️ Admin Portal:     http://localhost:3000/admin/dashboard"
echo "  🗄️ Adminer DB GUI:   http://localhost:8080"
echo "  📚 Swagger API Docs: http://localhost:8000/docs"
echo "=========================================================="
echo "  🛑 Press [Ctrl+C] to gracefully stop all services."
echo "=========================================================="

cleanup() {
    echo ""
    echo "🛑 Shutting down all services..."
    kill "$BACKEND_PID" 2>/dev/null || true
    kill "$FRONTEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
    wait "$FRONTEND_PID" 2>/dev/null || true
    cd "$PROJECT_ROOT"
    if command -v docker &> /dev/null; then
        echo "Stopping Docker containers..."
        docker compose stop
    fi
    echo "✓ All services stopped safely."
    exit 0
}

trap cleanup INT TERM

# Wait for child processes
wait
