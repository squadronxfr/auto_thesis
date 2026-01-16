@echo off
echo.
echo 🚀 STARTING AGENT ARTEFACT API
echo ==============================
echo.

REM Check if we're in the right directory
if not exist "backend\agent\artifact\main.py" (
    echo ❌ Error: main.py not found!
    echo    Make sure you're running this from the project root directory
    echo    Expected: backend\agent\artifact\main.py
    pause
    exit /b 1
)

REM Check Redis status
echo 🔍 Checking Redis status...
docker ps | findstr redis-auto-thesis >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Redis not running! Starting Redis first...
    call start_redis.bat
    if %errorlevel% neq 0 (
        echo ❌ Failed to start Redis
        pause
        exit /b 1
    )
) else (
    echo ✅ Redis is running
)

REM Navigate to artifact directory
cd backend\agent\artifact

REM Check Python environment
if not exist ".venv\Scripts\python.exe" (
    echo ❌ Python virtual environment not found!
    echo    Please run: python -m venv .venv
    echo    Then: .venv\Scripts\pip install -r ../requirements.txt
    pause
    exit /b 1
)

echo ✅ Python environment found
echo.
echo 🚀 Starting Agent Artefact API on http://localhost:8002
echo    Press Ctrl+C to stop
echo.

REM Start the API
.venv\Scripts\python.exe main.py

echo.
echo 👋 Agent Artefact API stopped
pause