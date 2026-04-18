#!/usr/bin/env python3
"""
Test Demo Account Functionality
"""

import requests
import json

def test_demo_flow():
    """Test the demo account flow"""
    print("🎯 Testing Demo Account Flow...")
    
    # Test backend is running
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
        else:
            print("❌ Backend not responding")
            return False
    except Exception as e:
        print(f"❌ Backend error: {e}")
        return False
    
    # Test frontend is accessible
    try:
        response = requests.get("http://localhost:8080", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
        else:
            print("❌ Frontend not accessible")
            return False
    except Exception as e:
        print(f"❌ Frontend error: {e}")
        return False
    
    # Test analysis endpoint with demo data
    demo_data = {
        "resume_text": """
Alex Johnson
Full Stack Developer

EXPERIENCE:
• 3 years of full-stack development experience
• Built responsive web applications using React and Node.js
• Worked with PostgreSQL and MongoDB databases
• Experience with Docker containerization
• Familiar with AWS cloud services

SKILLS:
• Frontend: React, JavaScript, HTML5, CSS3, TypeScript
• Backend: Node.js, Express, Python, Django
• Databases: PostgreSQL, MongoDB, Redis
• DevOps: Docker, AWS, Git, CI/CD
• Tools: VS Code, Postman, Jira

PROJECTS:
• E-commerce Platform: React + Node.js + PostgreSQL
• Task Management App: Vue.js + Express + MongoDB
• Real-time Chat Application: Socket.io + Redis
        """,
        "jd_text": """
Senior Frontend Developer - React Specialist

REQUIRED SKILLS:
• 4+ years of frontend development experience
• Expert-level React.js and TypeScript
• Strong JavaScript fundamentals
• Experience with state management (Redux/Context)
• CSS3, SASS/SCSS, responsive design
• RESTful API integration
• Git version control
• Testing frameworks (Jest, React Testing Library)

NICE TO HAVE:
• Next.js or Gatsby experience
• GraphQL knowledge
• Docker and CI/CD
• AWS or other cloud platforms
        """
    }
    
    try:
        print("📤 Testing analysis with demo data...")
        response = requests.post(
            "http://localhost:8000/analyze",
            json=demo_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Analysis successful")
            print(f"   Candidate: {result.get('candidate_profile', {}).get('name', 'Unknown')}")
            print(f"   Role: {result.get('job_analysis', {}).get('role', 'Unknown')}")
            print(f"   Overall Score: {result.get('overall_score', 'N/A')}%")
            print(f"   Verdict: {result.get('verdict', 'N/A')}")
            
            # Check agent reports
            agent_reports = result.get('agent_reports', {})
            if agent_reports:
                print("   Virtual HR Panel:")
                for agent_id, report in agent_reports.items():
                    name = report.get('name', agent_id.upper())
                    verdict = report.get('verdict', 'N/A')
                    print(f"     {name}: {verdict}")
            
            return True
        else:
            print(f"❌ Analysis failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Analysis error: {e}")
        return False

def show_demo_instructions():
    """Show instructions for using the demo"""
    print("\n" + "=" * 60)
    print(" SkillOS Demo Account Instructions")
    print("=" * 60)
    
    print("\n🌐 Access the Application:")
    print("   1. Open: http://localhost:8080")
    print("   2. Click 'Try Demo Account' on the login page")
    print("   3. Explore the dashboard with pre-loaded analysis data")
    
    print("\n🎯 Demo Features:")
    print("   ✅ Pre-loaded analysis history (2 sample analyses)")
    print("   ✅ Virtual HR panel with 4 AI agents")
    print("   ✅ Skill gap analysis and recommendations")
    print("   ✅ Dashboard statistics and progress tracking")
    print("   ✅ Resume upload and new analysis creation")
    
    print("\n📊 Sample Data Included:")
    print("   • Frontend Developer Analysis (72% match)")
    print("   • Backend Python Developer Analysis (87% match)")
    print("   • Complete agent verdicts and feedback")
    print("   • Skill breakdown and learning recommendations")
    
    print("\n🔧 Demo Account Details:")
    print("   Email: demo@skillos.com")
    print("   Password: demo123456")
    print("   Name: Demo User")
    
    print("\n🚀 What to Test:")
    print("   1. View analysis history in dashboard")
    print("   2. Check detailed results and agent feedback")
    print("   3. Upload new resume for fresh analysis")
    print("   4. Explore learning roadmaps")
    print("   5. Test the virtual HR simulation")

if __name__ == "__main__":
    print("🎯 SkillOS Demo Account Test")
    print("=" * 40)
    
    success = test_demo_flow()
    
    if success:
        print("\n🎉 Demo account setup is working!")
        show_demo_instructions()
    else:
        print("\n❌ Demo setup has issues")
        print("Make sure both frontend and backend are running:")
        print("  Backend: python python-backend/main.py")
        print("  Frontend: npm run dev (in frontend directory)")
    
    print("\n" + "=" * 60)