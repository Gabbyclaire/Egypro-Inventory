@echo off
echo Starting Egypro IT Inventory...

:: Check if Node is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: Install dependencies if node_modules doesn't exist
if not exist "backend-service\node_modules" (
    echo Installing backend dependencies...
    cd backend-service
    call npm install
    cd ..
)

:: Start the backend server in a separate window
echo Starting backend server...
start "Egypro Backend Service" cmd /c "cd backend-service && node server.js"

:: Wait 2 seconds for the server to boot up
timeout /t 2 /nobreak >nul

:: Open the frontend in the default web browser
echo Opening frontend...
start index.html

echo.
echo Done! You can safely close this launcher window.
