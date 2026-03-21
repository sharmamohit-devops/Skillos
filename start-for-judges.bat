@echo off
echo 🎯 Gap Analysis - AI Resume Matching Platform
echo ==============================================
echo.
echo 🚀 Starting application for judges...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Build and start the application
echo 🔨 Building and starting the application...
docker-compose up --build -d

echo.
echo ⏳ Waiting for application to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo.
    echo ❌ Application failed to start. Check logs:
    echo    docker-compose logs
) else (
    echo.
    echo 🎉 Application is running successfully!
    echo.
    echo 📱 Access the application:
    echo    Frontend: http://localhost:3000
    echo    Backend API: http://localhost:8000
    echo    API Docs: http://localhost:8000/docs
    echo.
    echo 🛑 To stop the application:
    echo    docker-compose down
    echo.
    echo 📋 To view logs:
    echo    docker-compose logs -f
)

echo.
pause