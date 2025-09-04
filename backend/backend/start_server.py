#!/usr/bin/env python3
"""
Startup script for CogniML Loan Recommendation API
This script handles dependency checking and server startup
"""

import os
import sys
import subprocess
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_dependencies():
    """Check if all required Python packages are installed"""
    required_packages = [
        'fastapi', 'uvicorn', 'pydantic', 'pandas', 'numpy', 
        'joblib', 'psycopg2', 'dotenv', 'sklearn'
    ]
    
    missing = []
    for package in required_packages:
        try:
            if package == 'sklearn':
                import sklearn
            elif package == 'dotenv':
                import dotenv
            elif package == 'psycopg2':
                import psycopg2
            else:
                __import__(package)
            logger.info(f"✅ {package} - OK")
        except ImportError:
            logger.error(f"❌ {package} - Missing")
            missing.append(package)
    
    return missing

def install_requirements():
    """Install requirements from Requirements.txt"""
    try:
        logger.info("Installing requirements...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "Requirements.txt"])
        logger.info("Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install requirements: {e}")
        return False

def check_files():
    """Check if all required files are present"""
    required_files = [
        'main.py',
        'Database.py',
        'ml.py',
        '.env',
        'Requirements.txt',
        'cibil_database.csv',
        'eligibility_model.pkl',
        'product_model.pkl',
        'amount_model.pkl',
        'tenure_model.pkl',
        'rate_model.pkl',
        'label_encoders.pkl',
        'merged_training_dataset.csv'
    ]
    
    missing = []
    for file in required_files:
        if not os.path.exists(file):
            logger.error(f"❌ {file} - Missing")
            missing.append(file)
        else:
            logger.info(f"✅ {file} - Found")
    
    return missing

def start_server():
    """Start the FastAPI server"""
    try:
        logger.info("Starting CogniML API server...")
        os.system("python3 main.py")
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")

def main():
    """Main startup function"""
    logger.info("=== CogniML Loan Recommendation API Startup ===")
    
    # Check required files
    missing_files = check_files()
    if missing_files:
        logger.error(f"Missing files: {missing_files}")
        logger.error("Please ensure all required files are present")
        sys.exit(1)
    
    # Check dependencies
    missing_deps = check_dependencies()
    if missing_deps:
        logger.info(f"Missing dependencies: {missing_deps}")
        logger.info("Attempting to install...")
        if not install_requirements():
            logger.error("Failed to install dependencies. Please install manually:")
            logger.error(f"pip3 install -r Requirements.txt")
            sys.exit(1)
        
        # Check again after installation
        missing_deps = check_dependencies()
        if missing_deps:
            logger.error(f"Still missing: {missing_deps}")
            sys.exit(1)
    
    logger.info("All dependencies and files are available!")
    logger.info("Starting server...")
    start_server()

if __name__ == "__main__":
    main()