#!/usr/bin/env python3
"""
Setup script for AI-Adaptive Onboarding Engine
Initializes models and downloads required data
"""

import os
import sys
import logging
from data.dataset_loader import DatasetLoader

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def setup_environment():
    """Setup the Python environment and download required models"""
    logger.info("Setting up AI-Adaptive Onboarding Engine...")
    
    try:
        # Create necessary directories
        directories = [
            "data/raw",
            "data/processed", 
            "models/trained",
            "logs"
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
            logger.info(f"Created directory: {directory}")
        
        # Initialize dataset loader and export training data
        logger.info("Loading and processing datasets...")
        loader = DatasetLoader()
        stats = loader.export_training_data()
        
        logger.info("Dataset processing completed:")
        for key, value in stats.items():
            logger.info(f"  {key}: {value}")
        
        # Download and cache sentence transformer model
        logger.info("Downloading sentence transformer model...")
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("Sentence transformer model cached successfully")
        
        # Download NLTK data
        logger.info("Downloading NLTK data...")
        import nltk
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        logger.info("NLTK data downloaded successfully")
        
        logger.info("Setup completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Setup failed: {str(e)}")
        return False

def verify_setup():
    """Verify that all components are working correctly"""
    logger.info("Verifying setup...")
    
    try:
        # Test imports
        from models.skill_extractor import SkillExtractor
        from models.adaptive_pathfinder import AdaptivePathfinder
        from models.resume_parser import ResumeParser
        from models.jd_parser import JDParser
        
        # Initialize models
        skill_extractor = SkillExtractor()
        adaptive_pathfinder = AdaptivePathfinder()
        resume_parser = ResumeParser()
        jd_parser = JDParser()
        
        logger.info("All models initialized successfully")
        
        # Test basic functionality
        test_resume = """
        John Doe
        Software Engineer with 3 years experience
        Skills: Python, JavaScript, React, SQL, Git
        Education: BS Computer Science
        Projects: Web application, API development
        """
        
        test_jd = """
        Senior Software Engineer
        Requirements:
        - 5+ years experience
        - Python, JavaScript, React
        - Database knowledge
        - Cloud experience (AWS)
        """
        
        # Test parsing
        candidate_profile = resume_parser.parse(test_resume)
        job_analysis = jd_parser.parse(test_jd)
        
        logger.info(f"Resume parsing test: {candidate_profile['name']}")
        logger.info(f"JD parsing test: {job_analysis['role']}")
        
        # Test skill analysis
        skill_analysis = skill_extractor.analyze_skills(
            candidate_profile['skills'], 
            job_analysis['required_skills']
        )
        
        logger.info(f"Skill analysis test: {skill_analysis['skill_match_percentage']}% match")
        
        logger.info("Verification completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Verification failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("AI-Adaptive Onboarding Engine Setup")
    print("=" * 40)
    
    # Run setup
    if setup_environment():
        print("✓ Environment setup completed")
    else:
        print("✗ Environment setup failed")
        sys.exit(1)
    
    # Run verification
    if verify_setup():
        print("✓ Verification completed")
        print("\nSetup successful! You can now run the application with:")
        print("  python main.py")
        print("  or")
        print("  uvicorn main:app --reload")
    else:
        print("✗ Verification failed")
        sys.exit(1)