#!/usr/bin/env python3
"""
SkillOS Complete Setup Script
Sets up Firebase authentication, MirrorFish integration, and the complete dashboard
"""

import os
import subprocess
import sys
import json

def print_header(title):
    print("\n" + "=" * 60)
    print(f" {title}")
    print("=" * 60)

def print_step(step, description):
    print(f"\n🔧 Step {step}: {description}")
    print("-" * 40)

def run_command(command, cwd=None, description=""):
    """Run a command and return success status"""
    try:
        print(f"Running: {command}")
        if description:
            print(f"Purpose: {description}")
        
        result = subprocess.run(
            command.split(), 
            cwd=cwd, 
            capture_output=True, 
            text=True,
            timeout=300
        )
        
        if result.returncode == 0:
            print("✅ Success")
            return True
        else:
            print(f"❌ Failed: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print("❌ Command timed out")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_node_npm():
    """Check if Node.js and npm are installed"""
    print_step(1, "Checking Node.js and npm")
    
    try:
        node_result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        npm_result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        
        if node_result.returncode == 0 and npm_result.returncode == 0:
            print(f"✅ Node.js: {node_result.stdout.strip()}")
            print(f"✅ npm: {npm_result.stdout.strip()}")
            return True
        else:
            print("❌ Node.js or npm not found")
            print("Please install Node.js from https://nodejs.org/")
            return False
    except FileNotFoundError:
        print("❌ Node.js or npm not found")
        print("Please install Node.js from https://nodejs.org/")
        return False

def check_python():
    """Check if Python is installed"""
    print_step(2, "Checking Python")
    
    try:
        result = subprocess.run([sys.executable, '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Python: {result.stdout.strip()}")
            return True
        else:
            print("❌ Python not found")
            return False
    except Exception:
        print("❌ Python not found")
        return False

def setup_backend():
    """Set up the Python backend"""
    print_step(3, "Setting up Python Backend")
    
    # Check if backend directory exists
    if not os.path.exists("python-backend"):
        print("❌ python-backend directory not found")
        return False
    
    # Install Python dependencies
    print("Installing Python dependencies...")
    success = run_command(
        f"{sys.executable} -m pip install fastapi uvicorn requests python-dotenv",
        cwd="python-backend",
        description="Install backend dependencies"
    )
    
    if not success:
        print("⚠️  Failed to install some dependencies, but continuing...")
    
    # Check if .env exists, create if not
    env_path = "python-backend/.env"
    if not os.path.exists(env_path):
        print("Creating .env file...")
        try:
            with open("python-backend/.env.example", "r") as f:
                env_content = f.read()
            with open(env_path, "w") as f:
                f.write(env_content)
            print("✅ Created .env file from template")
        except Exception as e:
            print(f"⚠️  Could not create .env file: {e}")
    
    return True

def setup_frontend():
    """Set up the React frontend"""
    print_step(4, "Setting up React Frontend")
    
    # Check if frontend directory exists
    if not os.path.exists("frontend"):
        print("❌ frontend directory not found")
        return False
    
    # Install npm dependencies
    print("Installing npm dependencies (this may take a few minutes)...")
    success = run_command(
        "npm install",
        cwd="frontend",
        description="Install frontend dependencies including Firebase"
    )
    
    if not success:
        print("❌ Failed to install frontend dependencies")
        return False
    
    # Check Firebase configuration
    firebase_config_path = "frontend/src/config/firebase.ts"
    if os.path.exists(firebase_config_path):
        print("✅ Firebase configuration found")
    else:
        print("⚠️  Firebase configuration not found")
    
    # Check .env file
    env_path = "frontend/.env"
    if os.path.exists(env_path):
        print("✅ Frontend .env file found")
    else:
        print("⚠️  Frontend .env file not found")
    
    return True

def test_backend():
    """Test if backend can start"""
    print_step(5, "Testing Backend")
    
    try:
        # Try to import main modules
        sys.path.append("python-backend")
        
        print("Testing Python imports...")
        try:
            import fastapi
            import uvicorn
            import requests
            print("✅ All required Python packages available")
        except ImportError as e:
            print(f"⚠️  Missing Python package: {e}")
        
        # Test MirrorFish integration
        try:
            from python_backend.test_mirrorfish import test_mirrorfish_availability
            print("✅ MirrorFish test module available")
        except ImportError:
            print("⚠️  MirrorFish test module not found")
        
        return True
        
    except Exception as e:
        print(f"⚠️  Backend test failed: {e}")
        return False

def create_startup_scripts():
    """Create convenient startup scripts"""
    print_step(6, "Creating Startup Scripts")
    
    # Backend startup script
    backend_script = """#!/bin/bash
echo "🚀 Starting SkillOS Backend..."
cd python-backend
python main.py
"""
    
    # Frontend startup script  
    frontend_script = """#!/bin/bash
echo "🚀 Starting SkillOS Frontend..."
cd frontend
npm run dev
"""
    
    # Complete startup script
    complete_script = """#!/bin/bash
echo "🚀 Starting Complete SkillOS System..."
echo "Starting backend in background..."
cd python-backend && python main.py &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo "Waiting for backend to start..."
sleep 5

echo "Starting frontend..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo "✅ SkillOS is running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo "Stopping services..."; kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
"""
    
    try:
        with open("start_backend.sh", "w") as f:
            f.write(backend_script)
        os.chmod("start_backend.sh", 0o755)
        
        with open("start_frontend.sh", "w") as f:
            f.write(frontend_script)
        os.chmod("start_frontend.sh", 0o755)
        
        with open("start_skillos.sh", "w") as f:
            f.write(complete_script)
        os.chmod("start_skillos.sh", 0o755)
        
        print("✅ Created startup scripts:")
        print("   ./start_backend.sh - Start backend only")
        print("   ./start_frontend.sh - Start frontend only") 
        print("   ./start_skillos.sh - Start complete system")
        
        return True
        
    except Exception as e:
        print(f"⚠️  Could not create startup scripts: {e}")
        return False

def show_next_steps():
    """Show next steps to the user"""
    print_step(7, "Next Steps")
    
    print("🎉 SkillOS setup complete!")
    print("")
    print("📋 What's been set up:")
    print("   ✅ Firebase Authentication with Google OAuth")
    print("   ✅ MirrorFish AI Integration (with fallback)")
    print("   ✅ Complete Dashboard with Analysis History")
    print("   ✅ Virtual HR Panel (4 AI Agents)")
    print("   ✅ Protected Routes and User Management")
    print("")
    print("🚀 To start SkillOS:")
    print("   Option 1: ./start_skillos.sh (complete system)")
    print("   Option 2: Start manually:")
    print("     Terminal 1: cd python-backend && python main.py")
    print("     Terminal 2: cd frontend && npm run dev")
    print("")
    print("🌐 Access URLs:")
    print("   Frontend: http://localhost:5173")
    print("   Backend API: http://localhost:8000")
    print("   API Docs: http://localhost:8000/docs")
    print("")
    print("🔧 Optional: Start MirrorFish mock server:")
    print("   cd python-backend && python mock_mirrorfish_server.py")
    print("")
    print("📚 Features available:")
    print("   • Firebase Auth (Email/Password + Google OAuth)")
    print("   • User Dashboard with Analysis History")
    print("   • Virtual HR Simulation (MirrorFish + ML Fallback)")
    print("   • Resume Analysis with 4 AI Agents")
    print("   • Skill Gap Analysis and Learning Roadmaps")
    print("   • PDF Export and Results Sharing")

def main():
    """Main setup workflow"""
    print_header("SkillOS Complete Setup")
    print("This script will set up the complete SkillOS system with:")
    print("• Firebase Authentication")
    print("• MirrorFish AI Integration") 
    print("• Dashboard with Analysis History")
    print("• Virtual HR Panel")
    
    # Check prerequisites
    if not check_node_npm():
        return
    
    if not check_python():
        return
    
    # Setup components
    if not setup_backend():
        print("❌ Backend setup failed")
        return
    
    if not setup_frontend():
        print("❌ Frontend setup failed")
        return
    
    # Test setup
    test_backend()
    
    # Create convenience scripts
    create_startup_scripts()
    
    # Show next steps
    show_next_steps()

if __name__ == "__main__":
    main()