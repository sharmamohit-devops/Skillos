@echo off
echo ========================================
echo Starting SkillOS Backend Server
echo ========================================
echo.

cd python-backend

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo Starting Backend Server on port 8000
echo ========================================
echo.
echo Keep this window open while using the app!
echo Press Ctrl+C to stop the server
echo.

python main.py

pause
