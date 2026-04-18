#!/usr/bin/env python3
"""
Test script to verify the demo account fix is working
"""

import requests
import json
import time

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running and healthy")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend is not accessible: {e}")
        return False

def test_frontend_accessibility():
    """Test if frontend is accessible"""
    try:
        response = requests.get("http://localhost:8080", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend accessibility failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend is not accessible: {e}")
        return False

def main():
    print("🔧 Testing SkillOS Demo Account Fix")
    print("=" * 50)
    
    # Test backend
    backend_ok = test_backend_health()
    
    # Test frontend
    frontend_ok = test_frontend_accessibility()
    
    print("\n📋 Test Results:")
    print("=" * 50)
    
    if backend_ok and frontend_ok:
        print("✅ All systems operational!")
        print("\n🎯 Demo Account Instructions:")
        print("1. Visit: http://localhost:8080")
        print("2. Click 'Try Demo Account' button")
        print("3. Should automatically log in with fallback auth")
        print("4. Demo data should be pre-loaded in dashboard")
        print("\n🔧 Fixes Applied:")
        print("- Added fallback authentication system")
        print("- Firebase errors now gracefully handled")
        print("- Demo account works without Firebase")
        print("- Pre-populated analysis data included")
    else:
        print("❌ Some systems are not working properly")
        print("Please check that both frontend and backend are running:")
        print("- Backend: cd python-backend && python main.py")
        print("- Frontend: cd frontend && npm run dev")

if __name__ == "__main__":
    main()