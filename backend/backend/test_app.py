#!/usr/bin/env python3
"""
Test script to verify CogniML API functionality
"""

import sys
import os

def test_imports():
    """Test all imports from main.py"""
    try:
        # Test basic imports
        import logging
        import pandas as pd
        import numpy as np
        from fastapi import FastAPI
        from pydantic import BaseModel
        import joblib
        print("✅ Basic imports - OK")
        
        # Test database imports
        from Database import cibil_db
        print("✅ Database module - OK")
        
        # Test if models exist
        model_files = [
            'eligibility_model.pkl',
            'product_model.pkl', 
            'amount_model.pkl',
            'tenure_model.pkl',
            'rate_model.pkl',
            'label_encoders.pkl'
        ]
        
        for model_file in model_files:
            if os.path.exists(model_file):
                print(f"✅ {model_file} - Found")
            else:
                print(f"❌ {model_file} - Missing")
                return False
        
        # Test if CSV files exist
        csv_files = ['cibil_database.csv', 'merged_training_dataset.csv']
        for csv_file in csv_files:
            if os.path.exists(csv_file):
                print(f"✅ {csv_file} - Found")
            else:
                print(f"❌ {csv_file} - Missing")
                return False
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_model_loading():
    """Test if models can be loaded"""
    try:
        import joblib
        
        models = {}
        model_files = {
            'eligibility': 'eligibility_model.pkl',
            'product': 'product_model.pkl', 
            'amount': 'amount_model.pkl',
            'tenure': 'tenure_model.pkl',
            'rate': 'rate_model.pkl'
        }
        
        for name, file in model_files.items():
            if os.path.exists(file):
                models[name] = joblib.load(file)
                print(f"✅ {name} model loaded successfully")
            else:
                print(f"❌ {name} model file not found")
                return False
        
        # Test label encoders
        if os.path.exists('label_encoders.pkl'):
            label_encoders = joblib.load('label_encoders.pkl')
            print(f"✅ Label encoders loaded successfully")
        else:
            print(f"❌ Label encoders file not found")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Model loading error: {e}")
        return False

def test_database():
    """Test database functionality"""
    try:
        from Database import cibil_db
        
        # Test database initialization
        cibil_db.init_db()
        print("✅ Database initialization - OK")
        
        # Test getting stats
        stats = cibil_db.get_cibil_stats()
        print(f"✅ Database stats: {stats}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def main():
    """Run all tests"""
    print("=== CogniML API Test Suite ===")
    
    tests = [
        ("Import Test", test_imports),
        ("Model Loading Test", test_model_loading), 
        ("Database Test", test_database)
    ]
    
    all_passed = True
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        if not test_func():
            print(f"❌ {test_name} FAILED")
            all_passed = False
        else:
            print(f"✅ {test_name} PASSED")
    
    print(f"\n=== Test Results ===")
    if all_passed:
        print("✅ All tests PASSED - Application ready to run!")
        print("\nTo start the server:")
        print("  python3 main.py")
        print("  or")
        print("  python3 start_server.py")
        return 0
    else:
        print("❌ Some tests FAILED - Please fix issues before running")
        return 1

if __name__ == "__main__":
    sys.exit(main())