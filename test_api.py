#!/usr/bin/env python3
"""
Test script for SkillOS API
"""

import requests
import json

def test_backend_api():
    """Test the backend API endpoints"""
    print("🔍 Testing SkillOS Backend API...")
    
    # Test health endpoint
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health endpoint working")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False
    
    # Test analyze endpoint
    test_data = {
        "resume_text": """
John Smith
Senior Software Engineer

EXPERIENCE:
• 5 years of full-stack development
• Led team of 4 developers
• Built scalable web applications

SKILLS:
• Programming: Python, JavaScript, React
• Backend: Django, Flask, Node.js
• Database: PostgreSQL, MongoDB
• DevOps: Docker, AWS
• Tools: Git, Jenkins
        """,
        "jd_text": """
Senior Full Stack Developer

REQUIRED SKILLS:
• 4+ years of software development
• Python and JavaScript proficiency
• React or Vue.js experience
• Backend development (Django/Flask)
• Database design (PostgreSQL)
• Docker and AWS
• Git version control
        """
    }
    
    try:
        print("\n📤 Testing analyze endpoint...")
        response = requests.post(
            "http://localhost:8000/analyze",
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Analyze endpoint working")
            print(f"   Candidate: {result.get('candidate_profile', {}).get('name', 'Unknown')}")
            print(f"   Role: {result.get('job_analysis', {}).get('role', 'Unknown')}")
            print(f"   Overall Score: {result.get('overall_score', 'N/A')}%")
            print(f"   Simulation Source: {result.get('simulation_source', 'unknown')}")
            
            # Check agent reports
            agent_reports = result.get('agent_reports', {})
            if agent_reports:
                print("   Agent Verdicts:")
                for agent_id, report in agent_reports.items():
                    name = report.get('name', agent_id.upper())
                    verdict = report.get('verdict', 'N/A')
                    confidence = report.get('confidence', 'N/A')
                    print(f"     {name}: {verdict} ({confidence}% confidence)")
            
            return True
        else:
            print(f"❌ Analyze endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Analyze endpoint error: {e}")
        return False

if __name__ == "__main__":
    success = test_backend_api()
    if success:
        print("\n🎉 Backend API is working correctly!")
        print("\n🌐 Access the application:")
        print("   Frontend: http://localhost:8080")
        print("   Backend: http://localhost:8000")
        print("   API Docs: http://localhost:8000/docs")
    else:
        print("\n❌ Backend API has issues")