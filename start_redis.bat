@echo off
echo.
echo 🚀 AGENT ARTEFACT - REDIS SETUP
echo ================================
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not found! Please install Docker first.
    echo    Download: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker found

REM Check if Redis container already exists
docker ps -a | findstr redis-auto-thesis >nul 2>&1
if %errorlevel% == 0 (
    echo 🔄 Redis container exists, checking status...
    
    REM Check if it's running
    docker ps | findstr redis-auto-thesis >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ Redis already running
    ) else (
        echo 🔄 Starting existing Redis container...
        docker start redis-auto-thesis
        if %errorlevel% == 0 (
            echo ✅ Redis started successfully
        ) else (
            echo ❌ Failed to start Redis
            pause
            exit /b 1
        )
    )
) else (
    echo 🆕 Creating new Redis container with authentication...
    docker run --name redis-auto-thesis -d -p 6379:6379 redis:7-alpine redis-server --requirepass 123456
    if %errorlevel% == 0 (
        echo ✅ Redis container created and started
    ) else (
        echo ❌ Failed to create Redis container
        pause
        exit /b 1
    )
)

echo.
echo ⏳ Waiting for Redis to be ready...
timeout /t 3 /nobreak >nul

echo 🧪 Testing Redis connection...
cd /d "%~dp0backend\agent\artifact"

REM Test Redis connection
if exist ".venv\Scripts\python.exe" (
    .venv\Scripts\python.exe test_redis_connection.py
    if %errorlevel% == 0 (
        echo.
        echo 🎉 SUCCESS! Redis is ready for Agent Artefact
        echo.
        echo 📋 Next steps:
        echo    1. Start the API: .venv\Scripts\python.exe main.py
        echo    2. Test in Postman: GET http://localhost:8002/health
        echo.
        echo 💡 Quick start API command:
        echo    cd backend\agent\artifact ^&^& .venv\Scripts\python.exe main.py
    ) else (
        echo ❌ Redis connection test failed
    )
) else (
    echo ❌ Python virtual environment not found!
    echo    Expected: .venv\Scripts\python.exe
    echo    Please run: python -m venv .venv
)

echo.
echo 📊 Redis Management Commands:
echo    View status:    docker ps ^| findstr redis
echo    Stop Redis:     docker stop redis-auto-thesis  
echo    Restart Redis:  docker restart redis-auto-thesis
echo    Clean data:     docker exec -it redis-auto-thesis redis-cli -a 123456 FLUSHALL
echo.
pause