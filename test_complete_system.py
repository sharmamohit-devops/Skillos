#!/usr/bin/env python3
"""
Complete System Test for SkillOS with MirrorFish Integration
This script tests the entire pipeline from frontend to backend
"""

import requests
import json
import time
import sys

def test_backend_health():
    """Test if backend is running"""
    print("🔍 Testing Backend Health...")
    try:
        resp = requests.get("http://localhost:8000/health", timeout=5)
        if resp.status_code == 200:
            print("✅ Backend is healthy")
            return True
        else:
            print(f"❌ Backend health check failed: {resp.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend not reachable: {e}")
        return False

def test_mirrorfish_availability():
    """Test if MirrorFish is available"""
    print("\n🔍 Testing MirrorFish Availability...")
    try:
        resp = requests.get("http://localhost:5001/health", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            service = data.get("service", "unknown")
            if "mock" in service:
                print("✅ Mock MirrorFish is running")
            else:
                print("✅ Real MirrorFish is running")
            return True
        else:
            print(f"⚠️  MirrorFish responded with: {resp.status_code}")
            return False
    except Exception as e:
        print(f"⚠️  MirrorFish not available: {e}")
        print("   System will use ML fallback agents")
        return False

def test_analysis_pipeline():
    """Test the complete analysis pipeline"""
    print("\n🔍 Testing Analysis Pipeline...")
    
    # Sample test data
    test_data = {
        "resume_text": """
John Smith
Senior Software Engineer

EXPERIENCE:
• 5 years of full-stack development
• Led team of 4 developers
• Built scalable web applications

SKILLS:
• Programming: Python, JavaScript, TypeScript, Java
• Frontend: React, Vue.js, HTML5, CSS3
• Backend: Django, Flask, Node.js, Express
• Database: PostgreSQL, MongoDB, Redis
• DevOps: Docker, Kubernetes, AWS, CI/CD
• Tools: Git, Jenkins, Jira, Slack

PROJECTS:
• E-commerce Platform: Built using React + Django, handles 10k+ users
• Microservices API: Designed REST APIs with 99.9% uptime
• Real-time Chat App: WebSocket implementation with Redis
        """,
        "jd_text": """
Senior Full Stack Developer - Tech Startup

We're looking for a Senior Full Stack Developer to join our growing team.

REQUIRED SKILLS:
• 4+ years of software development experience
• Strong proficiency in Python and JavaScript
• Experience with React or Vue.js
• Backend development with Django or Flask
• Database design (PostgreSQL preferred)
• Docker and containerization
• AWS cloud services
• Git version control

NICE TO HAVE:
• Kubernetes experience
• Microservices architecture
• Real-time applications (WebSockets)
• Team leadership experience
• Startup environment experience

RESPONSIBILITIES:
• Design and develop scalable web applications
• Collaborate with product and design teams
• Mentor junior developers
• Participate in code reviews
• Contribute to technical architecture decisions
        """
    }
    
    try:
        print("📤 Sending analysis request...")
        start_time = time.time()
        
        resp = requests.post(
            "http://localhost:8000/analyze",
            json=test_data,
            timeout=90  # Allow time for MirrorFish
        )
        
        end_time = time.time()
        duration = end_time - start_time
        
        if resp.status_code == 200:
            result = resp.json()
            
            print(f"✅ Analysis completed in {duration:.1f} seconds")
            print("\n📊 RESULTS SUMMARY:")
            print(f"   Candidate: {result.get('candidate_profile', {}).get('name', 'Unknown')}")
            print(f"   Role: {result.get('job_analysis', {}).get('role', 'Unknown')}")
            print(f"   Overall Score: {result.get('overall_score', 'N/A')}%")
            print(f"   Skill Match: {result.get('skill_analysis', {}).get('skill_match_percentage', 'N/A')}%")
            print(f"   Verdict: {result.get('verdict', 'N/A')}")
            print(f"   Simulation Source: {result.get('simulation_source', 'unknown')}")
            
            # MirrorFish status
            mirrorfish_status = result.get('mirrorfish_status')
            if mirrorfish_status:
                print(f"   MirrorFish Status: {mirrorfish_status}")
            
            # Agent reports
            agent_reports = result.get('agent_reports', {})
            if agent_reports:
                print("\n🤖 AGENT VERDICTS:")
                for agent_id, report in agent_reports.items():
                    name = report.get('name', agent_id.upper())
                    role = report.get('role', 'Unknown')
                    verdict = report.get('verdict', 'N/A')
                    confidence = report.get('confidence', 'N/A')
                    print(f"   {name} ({role}): {verdict} ({confidence}% confidence)")
            
            # Skill analysis
            skill_analysis = result.get('skill_analysis', {})
            if skill_analysis:
                matched = len(skill_analysis.get('matched_skills', []))
                missing = len(skill_analysis.get('missing_skills', []))
                partial = len(skill_analysis.get('partial_skills', []))
                print(f"\n📈 SKILL BREAKDOWN:")
                print(f"   Matched: {matched} skills")
                print(f"   Partial: {partial} skills") 
                print(f"   Missing: {missing} skills")
            
            # Learning pathway
            pathway = result.get('learning_pathway', [])
            if pathway:
                print(f"\n🎯 LEARNING PATHWAY: {len(pathway)} modules generated")
            
            return True
            
        else:
            print(f"❌ Analysis failed: {resp.status_code}")
            try:
                error_data = resp.json()
                print(f"   Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"   Response: {resp.text[:200]}...")
            return False
            
    except requests.Timeout:
        print("❌ Analysis timed out (>90 seconds)")
        return False
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        return False

def test_frontend_connection():
    """Test if frontend can connect to backend"""
    print("\n🔍 Testing Frontend Configuration...")
    
    # Check if frontend .env has correct API URL
    try:
        with open("frontend/.env", "r") as f:
            content = f.read()
            if "VITE_API_URL=http://localhost:8000" in content:
                print("✅ Frontend API URL configured correctly")
                return True
            else:
                print("⚠️  Frontend API URL may not be configured")
                print("   Add VITE_API_URL=http://localhost:8000 to frontend/.env")
                return False
    except FileNotFoundError:
        print("⚠️  Frontend .env file not found")
        print("   Create frontend/.env with VITE_API_URL=http://localhost:8000")
        return False

def main():
    """Run complete system test"""
    print("=" * 60)
    print(" SkillOS Complete System Test")
    print("=" * 60)
    print("Testing the entire pipeline: Frontend → Backend → MirrorFish")
    
    # Test 1: Backend Health
    backend_ok = test_backend_health()
    if not backend_ok:
        print("\n❌ CRITICAL: Backend is not running!")
        print("   Start with: cd python-backend && python main.py")
        return
    
    # Test 2: MirrorFish Availability (optional)
    mirrorfish_ok = test_mirrorfish_availability()
    
    # Test 3: Frontend Configuration
    frontend_ok = test_frontend_connection()
    
    # Test 4: Complete Analysis Pipeline
    analysis_ok = test_analysis_pipeline()
    
    # Summary
    print("\n" + "=" * 60)
    print(" TEST SUMMARY")
    print("=" * 60)
    print(f"{'✅' if backend_ok else '❌'} Backend Health")
    print(f"{'✅' if mirrorfish_ok else '⚠️'} MirrorFish Availability")
    print(f"{'✅' if frontend_ok else '⚠️'} Frontend Configuration")
    print(f"{'✅' if analysis_ok else '❌'} Analysis Pipeline")
    
    if backend_ok and analysis_ok:
        print("\n🎉 SYSTEM IS WORKING!")
        print("\nNext steps:")
        print("1. Start frontend: cd frontend && npm run dev")
        print("2. Open browser: http://localhost:5173")
        print("3. Upload a resume and test the complete flow")
        
        if mirrorfish_ok:
            print("4. 🔮 MirrorFish integration is active!")
        else:
            print("4. 🤖 Using ML fallback agents (MirrorFish not available)")
            
    else:
        print("\n❌ SYSTEM HAS ISSUES")
        print("Check the errors above and fix them before proceeding")
    
    print("=" * 60)

if __name__ == "__main__":
    main()