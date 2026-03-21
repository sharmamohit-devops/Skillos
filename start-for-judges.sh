#!/bin/bash

echo "🎯 Gap Analysis - AI Resume Matching Platform"
echo "=============================================="
echo ""
echo "🚀 Starting application for judges..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Build and start the application
echo "🔨 Building and starting the application..."
docker-compose up --build -d

echo ""
echo "⏳ Waiting for application to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "🎉 Application is running successfully!"
    echo ""
    echo "📱 Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    echo ""
    echo "🛑 To stop the application:"
    echo "   docker-compose down"
    echo ""
    echo "📋 To view logs:"
    echo "   docker-compose logs -f"
else
    echo ""
    echo "❌ Application failed to start. Check logs:"
    echo "   docker-compose logs"
fi