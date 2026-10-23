@echo off
echo ==========================================================
echo   Stopping All HEMC Services...
echo ==========================================================

taskkill /FI "WINDOWTITLE eq HEMC Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq HEMC Frontend*" /T /F >nul 2>&1

echo Stopping Docker containers...
cd /d "%~dp0"
docker compose stop

echo ==========================================================
echo   All HEMC services have been stopped safely.
echo ==========================================================
pause
