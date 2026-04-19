@echo off
echo ========================================
echo Starting SkillOS Frontend
echo ========================================
echo.

cd frontend

echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
npm install

echo.
echo ========================================
echo Starting Frontend on port 5173
echo ========================================
echo.
echo Keep this window open while using the app!
echo Press Ctrl+C to stop the server
echo.
echo Open http://localhost:5173 in your browser
echo.

npm run dev

pause
