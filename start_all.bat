@echo off
echo ==========================================================
echo   HEMC 1-Click System Startup (Windows Defense Mode)
echo ==========================================================

cd /d "%~dp0"

echo [1/4] Starting Docker PostgreSQL and Adminer...
docker compose up -d

timeout /t 3 /nobreak >nul

echo [2/4] Applying migrations and seeding database...
cd backend
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)
call alembic upgrade head
call python seed.py

echo [3/4] Launching FastAPI Backend in new window...
start "HEMC Backend (Port 8000)" cmd /k "cd /d "%~dp0backend" && if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) && uvicorn app.main:app --reload --port 8000"

echo [4/4] Launching Next.js Frontend in new window...
start "HEMC Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo ==========================================================
echo   All Services Started in Separate Windows!
echo ==========================================================
echo   Student Portal:   http://localhost:3000
echo   Doctor Portal:    http://localhost:3000/doctor/dashboard
echo   Admin Portal:     http://localhost:3000/admin/dashboard
echo   Adminer DB GUI:   http://localhost:8080
echo   To stop all services, double-click: stop_all.bat
echo ==========================================================
pause
