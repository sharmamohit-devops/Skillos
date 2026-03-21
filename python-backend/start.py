#!/usr/bin/env python3
"""
Simple startup script for AI-Adaptive Onboarding Engine
"""

import os
import sys
import subprocess
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def install_dependencies():
    """Install required dependencies"""
    logger.info("Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        logger.info("Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install dependencies: {e}")
        return False

def download_nltk_data():
    """Download required NLTK data"""
    logger.info("Downloading NLTK data...")
    try:
        import nltk
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        logger.info("NLTK data downloaded successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to download NLTK data: {e}")
        return False

def create_directories():
    """Create necessary directories"""
    directories = ["data/raw", "data/processed", "models/trained", "logs"]
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"Created directory: {directory}")

def start_server():
    """Start the FastAPI server"""
    logger.info("Starting FastAPI server...")
    try:
        import uvicorn
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        return False

if __name__ == "__main__":
    print("AI-Adaptive Onboarding Engine")
    print("=" * 40)
    
    # Create directories
    create_directories()
    
    # Install dependencies if needed
    try:
        import fastapi
        import uvicorn
        logger.info("Dependencies already installed")
    except ImportError:
        if not install_dependencies():
            sys.exit(1)
    
    # Download NLTK data if needed
    try:
        import nltk
        nltk.data.find('tokenizers/punkt')
        logger.info("NLTK data already available")
    except (ImportError, LookupError):
        if not download_nltk_data():
            logger.warning("NLTK data download failed, continuing anyway...")
    
    # Start server
    logger.info("Setup completed! Starting server...")
    start_server()