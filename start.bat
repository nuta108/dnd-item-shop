@echo off
echo Starting D&D Item Shop...
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Start json-server in background
echo Starting backend server...
start /min cmd /c "npx json-server db.json --port 3001"

:: Wait for server to start
timeout /t 2 /nobreak >nul

:: Open browser and serve frontend
echo Starting app...
start http://localhost:5173
npx serve dist -p 5173 -s
