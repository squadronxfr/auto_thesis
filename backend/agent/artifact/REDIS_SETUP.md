# 🔧 Redis Setup & Management - Agent Artefact

## 🚀 Quick Start (Recommended)

### Step 1: Start Redis with Docker
```bash
# Start Redis with password authentication
docker run --name redis-auto-thesis -d -p 6379:6379 redis:7-alpine redis-server --requirepass 123456

# Verify it's running
docker ps | findstr redis
```

### Step 2: Test Redis Connection
```bash
cd c:\Users\soumayaj\Desktop\project-clean\auto_thesis\backend\agent\artifact
C:/Users/soumayaj/Desktop/project-clean/auto_thesis/.venv/Scripts/python.exe test_redis_connection.py
```

**Expected Output:**
```
🎉 REDIS PRÊT POUR L'AGENT ARTEFACT !
```

### Step 3: Start Agent Artefact API
```bash
cd c:\Users\soumayaj\Desktop\project-clean\auto_thesis\backend\agent\artifact
C:/Users/soumayaj/Desktop/project-clean/auto_thesis/.venv/Scripts/python.exe main.py
```

**Expected Output:**
```
✅ Connexion Redis établie
🚀 Démarrage Agent Artefact API sur http://localhost:8002
```

---

## 🛠️ Daily Workflow Commands

### Check Redis Status
```bash
docker ps | findstr redis
```

### Stop Redis (when done working)
```bash
docker stop redis-auto-thesis
```

### Restart Redis (next session)
```bash
docker start redis-auto-thesis
```

### Clean Redis Data (reset everything)
```bash
docker exec -it redis-auto-thesis redis-cli -a 123456 FLUSHALL
```

### View Redis Data
```bash
docker exec -it redis-auto-thesis redis-cli -a 123456
> KEYS artifact:*
> HGETALL artifact:metadata:your-project-id
```

---

## 🔄 Complete Setup Script

Create `start_redis.bat` in your project root:
```batch
@echo off
echo 🚀 Starting Redis for Agent Artefact...

REM Check if Redis container exists
docker ps -a | findstr redis-auto-thesis >nul
if %errorlevel% == 0 (
    echo ✅ Redis container found, starting...
    docker start redis-auto-thesis
) else (
    echo 🆕 Creating new Redis container...
    docker run --name redis-auto-thesis -d -p 6379:6379 redis:7-alpine redis-server --requirepass 123456
)

echo ⏳ Waiting for Redis to start...
timeout /t 3 /nobreak >nul

echo 🧪 Testing Redis connection...
cd backend\agent\artifact
.venv\Scripts\python.exe test_redis_connection.py

echo.
echo 🎯 Redis ready! You can now start the API:
echo cd backend\agent\artifact
echo .venv\Scripts\python.exe main.py
pause
```

### Usage:
```bash
# Double-click start_redis.bat or run:
start_redis.bat
```

---

## 🐛 Troubleshooting Guide

### Problem: "Connection refused"
**Solutions:**
```bash
# Check if Docker is running
docker --version

# Check if Redis container is running
docker ps | findstr redis

# Restart Redis container
docker restart redis-auto-thesis
```

### Problem: "Authentication failed"
**Solutions:**
```bash
# Check password in .env file
cat backend\.env | findstr REDIS_PASSWORD

# Should show: REDIS_PASSWORD=123456
```

### Problem: "Port 6379 already in use"
**Solutions:**
```bash
# Find what's using the port
netstat -ano | findstr :6379

# Stop existing Redis
docker stop redis-auto-thesis

# Or use different port
docker run --name redis-auto-thesis-alt -d -p 6380:6379 redis:7-alpine redis-server --requirepass 123456
```

### Problem: "API can't connect to Redis"
**Check List:**
1. ✅ Redis container running: `docker ps | findstr redis`
2. ✅ Environment variables: Check `backend\.env`
3. ✅ Network: `telnet localhost 6379`
4. ✅ Restart API after Redis changes

---

## 📊 Redis Data Structure (Agent Artefact)

### Keys Created:
```
artifact:memory:{project_id}           # Project memory
artifact:metadata:{project_id}         # Project metadata  
artifact:snapshot:{project_id}:{timestamp} # Project snapshots
artifact:memory:index                   # Index of all projects
artifact:cache:{project_id}:{agent}    # Agent context cache
```

### Example Data:
```bash
# Connect to Redis
docker exec -it redis-auto-thesis redis-cli -a 123456

# View all Agent Artefact keys
KEYS artifact:*

# View project metadata
HGETALL artifact:metadata:test-001

# View project list
SMEMBERS artifact:memory:index
```

---

## 🔐 Security Configuration

### Current Setup:
- **Password:** `123456` (development)
- **Network:** localhost only
- **Docker:** isolated container

### For Production:
```bash
# Strong password
docker run --name redis-production -d -p 6379:6379 \
  redis:7-alpine redis-server --requirepass "YourStrongPasswordHere123!"

# Update .env
REDIS_PASSWORD=YourStrongPasswordHere123!
```

---

## 📈 Performance Monitoring

### Redis Stats:
```bash
docker exec -it redis-auto-thesis redis-cli -a 123456 INFO memory
```

### Cleanup Old Data:
```bash
# Remove expired keys
docker exec -it redis-auto-thesis redis-cli -a 123456 EVAL "
local keys = redis.call('keys', 'artifact:cache:*')
for i=1,#keys do
    if redis.call('ttl', keys[i]) == -1 then
        redis.call('del', keys[i])
    end
end
return #keys" 0
```

---

## 🚀 One-Command Setup

**For new setup:**
```bash
# Clone, setup Redis, test, and start API
git clone your-repo && cd auto_thesis && docker run --name redis-auto-thesis -d -p 6379:6379 redis:7-alpine redis-server --requirepass 123456 && cd backend\agent\artifact && .venv\Scripts\python.exe test_redis_connection.py && .venv\Scripts\python.exe main.py
```

**For daily work:**
```bash
# Start Redis + API
docker start redis-auto-thesis && cd backend\agent\artifact && .venv\Scripts\python.exe main.py
```

---

## 📋 Quick Reference

| Command | Purpose |
|---------|---------|
| `docker start redis-auto-thesis` | Start Redis |
| `docker stop redis-auto-thesis` | Stop Redis |
| `docker restart redis-auto-thesis` | Restart Redis |
| `python test_redis_connection.py` | Test connection |
| `python main.py` | Start API |
| `docker exec -it redis-auto-thesis redis-cli -a 123456` | Redis CLI |

**🎯 Most Common Workflow:**
1. `docker start redis-auto-thesis`  
2. `python main.py`
3. Test in Postman: `GET http://localhost:8002/health`