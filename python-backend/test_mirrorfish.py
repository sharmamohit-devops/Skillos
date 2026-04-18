"""
Test script for MirrorFish integration
Run this to verify MirrorFish connectivity and seed document generation
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.mirrorfish_service import (
    build_seed_document,
    check_mirrorfish_available,
    MIRRORFISH_BASE
)

def test_mirrorfish_availability():
    """Test if MirrorFish is running"""
    print("=" * 60)
    print("Testing MirrorFish Availability")
    print("=" * 60)
    print(f"MirrorFish URL: {MIRRORFISH_BASE}")
    
    is_available = check_mirrorfish_available()
    
    if is_available:
        print("✅ MirrorFish is AVAILABLE and responding")
        
        # Test additional endpoints
        try:
            import requests
            headers = {}
            api_key = os.getenv("MIRRORFISH_API_KEY")
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"
            
            # Test health endpoint
            health_resp = requests.get(f"{MIRRORFISH_BASE}/health", headers=headers, timeout=5)
            print(f"   Health endpoint: {health_resp.status_code}")
            
            # Test API status
            status_resp = requests.get(f"{MIRRORFISH_BASE}/api/status", headers=headers, timeout=5)
            print(f"   API status: {status_resp.status_code}")
            
        except Exception as e:
            print(f"   Additional tests failed: {e}")
        
        return True
    else:
        print("❌ MirrorFish is NOT AVAILABLE")
        print("\nTo start MirrorFish:")
        print("1. Navigate to your MirrorFish directory")
        print("2. Run: python app.py")
        print("3. Verify it's running at http://localhost:5001")
        print("4. Check that the /health endpoint responds")
        return False

def test_seed_document_generation():
    """Test seed document builder"""
    print("\n" + "=" * 60)
    print("Testing Seed Document Generation")
    print("=" * 60)
    
    # Mock ML result
    mock_ml_result = {
        "candidate_profile": {
            "name": "John Doe",
            "experience": "3 years",
            "skills": ["Python", "React", "Docker"]
        },
        "skill_analysis": {
            "matched_skills": ["Python", "React"],
            "missing_skills": ["Kubernetes", "AWS"]
        },
        "evaluation": {
            "match_score": 72,
            "risk_factors": ["Limited DevOps experience", "No cloud platform expertise"]
        }
    }
    
    resume_text = """
    John Doe
    Software Engineer with 3 years of experience
    
    Skills: Python, Django, React, PostgreSQL, Docker
    
    Experience:
    - Built multiple production web applications
    - Developed RESTful APIs using Django
    - Created responsive frontends with React
    """
    
    job_description = """
    Full Stack Engineer
    
    We're looking for a talented Full Stack Engineer to join our team.
    
    Required Skills:
    - Python (Django/Flask)
    - React or Vue.js
    - Docker and Kubernetes
    - AWS or GCP
    - PostgreSQL
    
    Nice to have:
    - CI/CD experience
    - Microservices architecture
    """
    
    try:
        seed = build_seed_document(mock_ml_result, resume_text, job_description)
        
        print("\n✅ Seed document generated successfully!")
        print("\n" + "-" * 60)
        print("SEED DOCUMENT PREVIEW:")
        print("-" * 60)
        print(seed[:500] + "...")
        print("-" * 60)
        print(f"\nTotal length: {len(seed)} characters")
        
        # Check for required sections
        has_candidate = "=== CANDIDATE PROFILE ===" in seed
        has_role = "=== TARGET ROLE ===" in seed
        has_query = "=== PREDICTION QUERY ===" in seed
        
        print("\nSection Check:")
        print(f"  {'✅' if has_candidate else '❌'} Candidate Profile")
        print(f"  {'✅' if has_role else '❌'} Target Role")
        print(f"  {'✅' if has_query else '❌'} Prediction Query")
        
        if has_candidate and has_role and has_query:
            print("\n✅ All required sections present")
            return True
        else:
            print("\n❌ Some sections missing")
            return False
            
    except Exception as e:
        print(f"\n❌ Error generating seed document: {e}")
        return False

def test_environment_variables():
    """Test environment variable configuration"""
    print("\n" + "=" * 60)
    print("Testing Environment Variables")
    print("=" * 60)
    
    env_vars = {
        "MIRRORFISH_BASE_URL": os.getenv("MIRRORFISH_BASE_URL", "NOT SET"),
        "MIRRORFISH_NUM_ROUNDS": os.getenv("MIRRORFISH_NUM_ROUNDS", "NOT SET"),
        "MIRRORFISH_TIMEOUT": os.getenv("MIRRORFISH_TIMEOUT", "NOT SET"),
        "MIRRORFISH_API_KEY": os.getenv("MIRRORFISH_API_KEY", "NOT SET"),
    }
    
    all_set = True
    for var, value in env_vars.items():
        status = "✅" if value != "NOT SET" else "⚠️"
        print(f"{status} {var}: {value if value != 'NOT SET' else 'Using default'}")
        if value == "NOT SET" and var == "MIRRORFISH_API_KEY":
            all_set = False
    
    if not all_set:
        print("\n⚠️  Some environment variables not set")
        print("Create a .env file with:")
        print("  MIRRORFISH_BASE_URL=http://localhost:5001")
        print("  MIRRORFISH_NUM_ROUNDS=15")
        print("  MIRRORFISH_TIMEOUT=30")
        print("  MIRRORFISH_API_KEY=your_api_key_here")
    else:
        print("\n✅ All environment variables configured")
    
    return all_set

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("MIRRORFISH INTEGRATION TEST SUITE")
    print("=" * 60)
    
    # Test 1: Environment variables
    env_ok = test_environment_variables()
    
    # Test 2: Seed document generation
    seed_ok = test_seed_document_generation()
    
    # Test 3: MirrorFish availability
    mirrorfish_ok = test_mirrorfish_availability()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"{'✅' if env_ok else '⚠️'}  Environment Variables")
    print(f"{'✅' if seed_ok else '❌'} Seed Document Generation")
    print(f"{'✅' if mirrorfish_ok else '❌'} MirrorFish Availability")
    
    if seed_ok and mirrorfish_ok:
        print("\n🎉 All tests passed! MirrorFish integration is ready.")
        print("\nNext steps:")
        print("1. Start the backend: python main.py")
        print("2. Test the /analyze endpoint with a real resume")
        print("3. Check logs for MirrorFish activity")
    elif seed_ok and not mirrorfish_ok:
        print("\n⚠️  Seed generation works, but MirrorFish is not available.")
        print("The system will fall back to ML-based agents.")
    else:
        print("\n❌ Some tests failed. Check the errors above.")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
