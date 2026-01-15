@echo off
echo.
echo 📊 AGENT ARTEFACT - SYSTEM STATUS
echo ==================================
echo.

echo 🔍 Checking Docker...
docker --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Docker is installed
    for /f "tokens=3" %%i in ('docker --version') do echo    Version: %%i
) else (
    echo ❌ Docker not found
    echo    Download: https://www.docker.com/products/docker-desktop
)

echo.
echo 🔍 Checking Redis Container...
docker ps -a | findstr redis-auto-thesis >nul 2>&1
if %errorlevel% == 0 (
    docker ps | findstr redis-auto-thesis >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ Redis container is RUNNING
        for /f "tokens=*" %%i in ('docker ps --filter "name=redis-auto-thesis" --format "table {{.Image}}\t{{.Status}}"') do echo    %%i
    ) else (
        echo ⚠️  Redis container exists but is STOPPED
        echo    Run: docker start redis-auto-thesis
    )
) else (
    echo ❌ Redis container not found
    echo    Run: start_redis.bat
)

echo.
echo 🔍 Checking Redis Connection...
if exist "backend\agent\artifact\test_redis_connection.py" (
    cd backend\agent\artifact
    if exist ".venv\Scripts\python.exe" (
        echo 🧪 Testing Redis connection...
        .venv\Scripts\python.exe test_redis_connection.py >nul 2>&1
        if %errorlevel% == 0 (
            echo ✅ Redis connection successful
        ) else (
            echo ❌ Redis connection failed
        )
        cd ..\..\..\
    ) else (
        echo ❌ Python virtual environment not found
    )
) else (
    echo ❌ Redis test script not found
)

echo.
echo 🔍 Checking API Status...
curl -s http://localhost:8002/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Agent Artefact API is RUNNING on http://localhost:8002
) else (
    echo ❌ Agent Artefact API is not responding
    echo    To start: start_api.bat
)

echo.
echo 🔍 Checking Project Files...
if exist "backend\agent\artifact\main.py" (
    echo ✅ API main.py found
) else (
    echo ❌ API main.py not found
)

if exist "backend\.env" (
    echo ✅ Environment config found
    findstr "GEMINI_API_KEY" backend\.env >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ Gemini API key configured
    ) else (
        echo ❌ Gemini API key not found in .env
    )
    
    findstr "REDIS_PASSWORD" backend\.env >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ Redis password configured
    ) else (
        echo ❌ Redis password not found in .env
    )
) else (
    echo ❌ Environment config (.env) not found
)

echo.
echo 📋 QUICK ACTIONS:
echo    Start Redis:     start_redis.bat
echo    Start API:       start_api.bat  
echo    Stop Redis:      docker stop redis-auto-thesis
echo    View Redis data: docker exec -it redis-auto-thesis redis-cli -a 123456
echo    Test Postman:    GET http://localhost:8002/health
echo.

echo 🎯 RECOMMENDED WORKFLOW:
echo    1. start_redis.bat     (setup Redis)
echo    2. start_api.bat       (start API)
echo    3. Test in Postman     (verify everything works)
echo.
pause