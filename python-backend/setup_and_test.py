#!/usr/bin/env python3
"""
SkillOS MirrorFish Integration Setup and Test Script
This script helps you set up and test the MirrorFish integration
"""

import os
import sys
import subprocess
import time
import requests
import json


def print_header(title):
    print("\n" + "=" * 60)
    print(f" {title}")
    print("=" * 60)


def print_step(step, description):
    print(f"\n🔧 Step {step}: {description}")
    print("-" * 40)


def check_python_dependencies():
    """Check if required Python packages are installed"""
    print_step(1, "Checking Python Dependencies")

    required_packages = [
        "fastapi",
        "uvicorn",
        "requests",
        "asyncio",
        "pydantic",
        "python-dotenv",
    ]

    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package}")
            missing_packages.append(package)

    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("Install with: pip install " + " ".join(missing_packages))
        return False

    print("\n✅ All Python dependencies are installed")
    return True


def setup_environment():
    """Set up environment variables"""
    print_step(2, "Setting up Environment Variables")

    env_file = ".env"
    if os.path.exists(env_file):
        print(f"✅ {env_file} already exists")

        # Read and display current settings
        with open(env_file, "r") as f:
            content = f.read()
            print("\nCurrent settings:")
            for line in content.split("\n"):
                if line.strip() and not line.startswith("#"):
                    print(f"   {line}")
    else:
        print(f"⚠️  {env_file} not found, creating from template...")

        # Copy from example
        if os.path.exists(".env.example"):
            import shutil

            shutil.copy(".env.example", env_file)
            print(f"✅ Created {env_file} from .env.example")
        else:
            print("❌ .env.example not found")
            return False

    return True


def start_mock_mirrorfish():
    """Start the mock MirrorFish server"""
    print_step(3, "Starting Mock MirrorFish Server")

    try:
        # Check if MirrorFish is already running
        resp = requests.get("http://localhost:5001/health", timeout=2)
        if resp.status_code == 200:
            data = resp.json()
            if "mock_mirrorfish" in data.get("service", ""):
                print("✅ Mock MirrorFish server is already running")
                return True
            else:
                print("⚠️  Real MirrorFish detected at localhost:5001")
                return True
    except:
        pass

    print("🚀 Starting mock MirrorFish server...")
    print("   (This will run in the background)")

    # Start mock server in background
    try:
        subprocess.Popen(
            [sys.executable, "mock_mirrorfish_server.py"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        # Wait for server to start
        for i in range(10):
            time.sleep(1)
            try:
                resp = requests.get("http://localhost:5001/health", timeout=2)
                if resp.status_code == 200:
                    print("✅ Mock MirrorFish server started successfully")
                    return True
            except:
                continue

        print("❌ Failed to start mock MirrorFish server")
        return False

    except Exception as e:
        print(f"❌ Error starting mock server: {e}")
        return False


def test_mirrorfish_integration():
    """Test the MirrorFish integration"""
    print_step(4, "Testing MirrorFish Integration")

    try:
        # Import and run the test
        from test_mirrorfish import main as run_tests

        run_tests()
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False


def start_backend_server():
    """Start the SkillOS backend server"""
    print_step(5, "Starting SkillOS Backend Server")

    try:
        # Check if server is already running
        resp = requests.get("http://localhost:8000/health", timeout=2)
        if resp.status_code == 200:
            print("✅ SkillOS backend is already running")
            return True
    except:
        pass

    print("🚀 Starting SkillOS backend server...")
    print("   Server will run at: http://localhost:8000")
    print("   Press Ctrl+C to stop")

    try:
        subprocess.run([sys.executable, "main.py"])
        return True
    except KeyboardInterrupt:
        print("\n⏹️  Server stopped by user")
        return True
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        return False


def test_full_pipeline():
    """Test the complete analysis pipeline"""
    print_step(6, "Testing Complete Analysis Pipeline")

    # Sample data
    test_data = {
        "resume_text": """
John Doe
Software Engineer

Skills: Python, React, Docker, PostgreSQL, Git
Experience: 3 years of full-stack development
Projects: Built e-commerce platform, REST APIs, responsive web apps
        """,
        "jd_text": """
Full Stack Developer Position

Required Skills:
- Python (Django/Flask)
- React or Vue.js  
- Docker and Kubernetes
- PostgreSQL or MySQL
- Git version control

Experience: 2-4 years
        """,
    }

    try:
        print("📤 Sending test request to /analyze endpoint...")

        resp = requests.post(
            "http://localhost:8000/analyze", json=test_data, timeout=60
        )

        if resp.status_code == 200:
            result = resp.json()

            print("✅ Analysis completed successfully!")
            print(f"   Simulation source: {result.get('simulation_source', 'unknown')}")
            print(f"   Overall score: {result.get('overall_score', 'N/A')}%")
            print(f"   Verdict: {result.get('verdict', 'N/A')}")

            if result.get("simulation_source") == "mirrorfish":
                print("🎉 MirrorFish integration working!")
            else:
                print("⚠️  Using ML fallback agents")

            return True
        else:
            print(f"❌ Analysis failed: {resp.status_code}")
            print(f"   Response: {resp.text}")
            return False

    except Exception as e:
        print(f"❌ Pipeline test failed: {e}")
        return False


def main():
    """Main setup and test workflow"""
    print_header("SkillOS MirrorFish Integration Setup")
    print("This script will help you set up and test the MirrorFish integration")

    # Step 1: Check dependencies
    if not check_python_dependencies():
        print("\n❌ Setup failed: Missing dependencies")
        return

    # Step 2: Setup environment
    if not setup_environment():
        print("\n❌ Setup failed: Environment configuration")
        return

    # Step 3: Start mock MirrorFish (optional)
    print("\n" + "?" * 60)
    choice = input("Start mock MirrorFish server? (y/n): ").lower().strip()
    if choice in ["y", "yes"]:
        start_mock_mirrorfish()

    # Step 4: Test integration
    test_mirrorfish_integration()

    # Step 5: Ask about starting backend
    print("\n" + "?" * 60)
    choice = input("Start SkillOS backend server? (y/n): ").lower().strip()
    if choice in ["y", "yes"]:
        start_backend_server()
    else:
        print("\n✅ Setup complete!")
        print("\nTo start the backend manually:")
        print("   python main.py")
        print("\nTo test the integration:")
        print("   python test_mirrorfish.py")


if __name__ == "__main__":
    main()
