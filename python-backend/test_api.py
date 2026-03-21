#!/usr/bin/env python3
"""
Simple test script to verify the API is working
"""

import requests
import json

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_analysis():
    """Test analysis endpoint with sample data"""
    sample_data = {
        "resume_text": """
        John Doe
        Software Engineer with 3 years experience
        Skills: Python, JavaScript, React, SQL, Git
        Education: BS Computer Science
        Projects: E-commerce website, REST API development
        Experience: Full-stack developer at Tech Corp
        """,
        "jd_text": """
        Senior Full Stack Developer
        
        Requirements:
        - 5+ years of software development experience
        - Proficiency in Python, JavaScript, React, Node.js
        - Experience with cloud platforms (AWS, Azure)
        - Database knowledge (PostgreSQL, MongoDB)
        - Docker and Kubernetes experience
        - Agile/Scrum methodology
        
        Tech Stack: Python, React, Node.js, PostgreSQL, Docker, AWS
        """
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/analyze",
            json=sample_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Analysis test: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Analysis successful!")
            print(f"Candidate: {result['candidate_profile']['name']}")
            print(f"Role: {result['job_analysis']['role']}")
            print(f"Skill match: {result['skill_analysis']['skill_match_percentage']:.1f}%")
            print(f"Missing skills: {len(result['skill_analysis']['missing_skills'])}")
            print(f"Learning modules: {len(result.get('learning_pathway', []))}")
            return True
        else:
            print(f"❌ Analysis failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"Analysis test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing AI-Adaptive Onboarding Engine API")
    print("=" * 50)
    
    # Test health
    if test_health():
        print("✅ Health check passed")
    else:
        print("❌ Health check failed")
        exit(1)
    
    print()
    
    # Test analysis
    if test_analysis():
        print("✅ Analysis test passed")
        print("\n🎉 All tests passed! The API is working correctly.")
    else:
        print("❌ Analysis test failed")
        exit(1)