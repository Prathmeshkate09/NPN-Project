import logging
import os
from contextlib import asynccontextmanager
from typing import Any, Dict, Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator

# Import the database module
from Database import cibil_db


# --- INITIAL SETUP ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for in-memory storage
models = {}
label_encoders = {}


# --- CORE FUNCTIONS ---
def load_ml_models():
    """Load all ML models and encoders from disk into memory."""
    global models, label_encoders
    try:
        model_files = {
            'eligibility': 'eligibility_model.pkl', 'product': 'product_model.pkl',
            'amount': 'amount_model.pkl', 'tenure': 'tenure_model.pkl', 'rate': 'rate_model.pkl'
        }
        for name, file in model_files.items():
            if os.path.exists(file):
                models[name] = joblib.load(file)
            else:
                raise FileNotFoundError(f"Model file not found: {file}")

        if os.path.exists('label_encoders.pkl'):
            label_encoders = joblib.load('label_encoders.pkl')
        else:
            raise FileNotFoundError("Label encoders file not found: label_encoders.pkl")

        logger.info("All ML models and encoders loaded successfully.")
    except Exception as e:
        logger.error(f"Fatal error during model loading: {e}")
        raise


def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    """
    Calculate EMI using the standard compound interest formula.
    
    EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
    Where:
    - P = Principal loan amount
    - r = Monthly interest rate (annual rate / 12 / 100)
    - n = Number of monthly installments (tenure)
    
    Args:
        principal: Loan amount
        annual_rate: Annual interest rate (percentage)
        tenure_months: Loan tenure in months
    
    Returns:
        Monthly EMI amount
    """
    if tenure_months <= 0 or annual_rate < 0:
        return 0.0
    
    # Handle zero interest rate case (interest-free loans)
    if annual_rate == 0:
        return principal / tenure_months
    
    # Convert annual rate to monthly rate (as decimal)
    monthly_rate = annual_rate / (12 * 100)
    
    # EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    numerator = principal * monthly_rate * ((1 + monthly_rate) ** tenure_months)
    denominator = ((1 + monthly_rate) ** tenure_months) - 1
    
    return numerator / denominator


def encode_categorical_features(request: 'LoanRequest') -> tuple:
    """Encode categorical features using the loaded label encoders."""
    try:
        gender_enc = label_encoders['Gender'].transform([request.gender])[0]
        marital_enc = label_encoders['Marital Status'].transform([request.marital_status])[0]
        property_enc = label_encoders['Type of Property (Rented/Owned)'].transform([request.property_type])[0]
        education_enc = label_encoders['Education level'].transform([request.education])[0]
        employment_enc = label_encoders['Employment Status'].transform([request.employment])[0]
        return gender_enc, marital_enc, property_enc, education_enc, employment_enc
    except KeyError as e:
        logger.error(f"Invalid categorical value provided: {e}")
        raise ValueError(f"Invalid value for feature: {e}. Please use a valid category.")


def check_eligibility_rules(cibil_score: int, salary: float, age: int) -> tuple:
    """
    Rule-based eligibility check that properly supports all product tiers including Silver Credit Card Loan.
    Based on actual data analysis from merged_training_dataset.csv
    
    Returns: (eligibility_status, recommendations_list)
    """
    recommendations = []
    
    # Basic age eligibility
    if age < 18 or age > 70:
        return 0, ["Age must be between 18-70 years for loan eligibility"]
    
    # CIBIL score based eligibility (aligned with actual data patterns)
    if cibil_score < 550:
        recommendations = [
            "CIBIL score too low. Minimum requirement is 550 for basic loan products",
            "Pay existing debts on time to improve CIBIL score",
            "Check CIBIL report for errors and dispute if found"
        ]
        return 0, recommendations
    
    # Income based eligibility  
    if salary < 15000:
        recommendations = [
            "Minimum monthly income requirement is ₹15,000",
            "Increase income stability through consistent employment"
        ]
        return 0, recommendations
    
    # All checks passed - eligible for at least Silver tier products
    # Note: Product type will be determined by the ML model based on profile
    if cibil_score < 600:
        recommendations = [
            "Eligible for Silver tier products",
            "Improve CIBIL score to 700+ for better product options and lower interest rates"
        ]
    elif cibil_score < 650:
        recommendations = [
            "Eligible for Silver and Gold tier products", 
            "Improve CIBIL score to 750+ for Platinum products with best rates"
        ]
    elif cibil_score < 700:
        recommendations = [
            "Eligible for Silver and Gold tier products",
            "Good CIBIL score - you may qualify for favorable terms"
        ]
    else:
        recommendations = [
            "Excellent profile - eligible for all product tiers including Platinum",
            "Your high CIBIL score qualifies you for the best interest rates"
        ]
    
    return 1, recommendations


def generate_loan_recommendation(request: 'LoanRequest', cibil_score: int) -> Dict[str, Any]:
    """
    Generate a full loan recommendation based on user profile and CIBIL score.
    """
    gender_enc, marital_enc, property_enc, education_enc, employment_enc = encode_categorical_features(request)

    base_profile = np.array([[
        request.age, gender_enc, marital_enc, property_enc,
        education_enc, employment_enc, request.experience,
        request.salary, cibil_score
    ]])

    # Use rule-based eligibility for better Silver Credit Card Loan support
    eligibility, eligibility_reason = check_eligibility_rules(cibil_score, request.salary, request.age)
    
    # Still get ML model probability for reference
    try:
        eligibility_prob = models['eligibility'].predict_proba(base_profile)[0][1]
    except:
        eligibility_prob = 0.5

    if eligibility == 0:
        return {
            'eligibility_status': 'Not Eligible',
            'recommended_product_type': 'None', 'optimal_loan_amount': 0, 'tenure_months': 0,
            'interest_rate': 0, 'eligibility_probability': round(eligibility_prob * 100, 2),
            'monthly_emi': 0,
            'recommendations': eligibility_reason
        }

    product_type_encoded = models['product'].predict(base_profile)[0]
    product_type = label_encoders['Product Type'].inverse_transform([int(product_type_encoded)])[0]

    product_profile = np.column_stack([base_profile, [[product_type_encoded]]])
    loan_amount = models['amount'].predict(product_profile)[0]

    amount_profile = np.column_stack([product_profile, [[loan_amount]]])
    tenure = models['tenure'].predict(amount_profile)[0]

    full_profile = np.column_stack([amount_profile, [[tenure]]])
    interest_rate = models['rate'].predict(full_profile)[0]

    # Calculate proper EMI using compound interest formula
    monthly_emi = calculate_emi(loan_amount, interest_rate, int(round(tenure)))
    
    # Calculate additional financial metrics
    total_amount_payable = monthly_emi * int(round(tenure))
    total_interest_payable = total_amount_payable - loan_amount
    
    # Calculate EMI to income ratio for affordability check
    annual_salary = request.salary * 12
    monthly_salary = request.salary
    emi_to_income_ratio = (monthly_emi / monthly_salary) * 100 if monthly_salary > 0 else 0
    
    # Generate enhanced recommendations based on financial metrics
    recommendations = ["Profile looks good for the recommended product."]
    
    if emi_to_income_ratio > 40:
        recommendations.append("EMI exceeds 40% of monthly income. Consider longer tenure or lower amount.")
    elif emi_to_income_ratio > 30:
        recommendations.append("EMI is manageable but consider your other expenses.")
    else:
        recommendations.append("EMI is well within affordable limits.")
    
    if total_interest_payable > loan_amount * 0.5:
        recommendations.append("💰 Consider shorter tenure to reduce total interest cost.")

    return {
        'eligibility_status': 'Eligible', 
        'recommended_product_type': product_type,
        'optimal_loan_amount': round(float(loan_amount), 2), 
        'tenure_months': int(round(tenure)),
        'interest_rate': round(float(interest_rate), 2),
        'eligibility_probability': round(eligibility_prob * 100, 2),
        'monthly_emi': round(monthly_emi, 2),
        'total_amount_payable': round(total_amount_payable, 2),
        'total_interest_payable': round(total_interest_payable, 2),
        'emi_to_income_ratio': round(emi_to_income_ratio, 2),
        'recommendations': recommendations
    }


# --- APPLICATION LIFESPAN (STARTUP/SHUTDOWN) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles application startup and shutdown events."""
    logger.info("Application startup...")
    load_ml_models()
    cibil_db.init_db()
    stats = cibil_db.get_cibil_stats()
    if stats.get('total_records', 0) == 0:
        logger.info("CIBIL database is empty. Loading data from cibil_database.csv...")
        cibil_db.load_csv_to_database()
    yield
    logger.info("Application shutdown.")


# --- FASTAPI APP INITIALIZATION ---
app = FastAPI(
    title="CogniML Loan Recommendation API",
    description="AI-powered loan eligibility and recommendation system with database integration.",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)


# --- PYDANTIC MODELS (API DATA STRUCTURES) ---
class LoanRequest(BaseModel):
    age: int = Field(..., ge=18, le=100)
    gender: str
    marital_status: str
    property_type: str
    education: str
    employment: str
    experience: int = Field(..., ge=0, le=50)
    salary: float = Field(..., gt=0)
    cibil_id: str = Field(..., min_length=1, description="Customer's CIBIL ID for score lookup")

    @validator('gender', 'marital_status', 'property_type', pre=True)
    def normalize_categorical_inputs(cls, v):
        """Cleans and standardizes string inputs before validation."""
        return v.strip().title() if isinstance(v, str) else v

    @validator('employment', pre=True)
    def normalize_employment_status(cls, v):
        """Normalize employment status input to match dataset values."""
        if isinstance(v, str):
            v = v.strip().title()
            
            # Handle employment status mapping from frontend to dataset values
            employment_mapping = {
                'Salaried': 'Salaried',
                'Employed': 'Salaried',
                'Employee': 'Salaried',
                'Job': 'Salaried',
                'Self-Employed': 'Self-Employed',
                'Self Employed': 'Self-Employed',
                'Selfemployed': 'Self-Employed',
                'Freelancer': 'Self-Employed',     # Map freelancer to Self-Employed
                'Consultant': 'Self-Employed',     # Map consultant to Self-Employed
                'Business': 'Self-Employed',       # Map business to Self-Employed
                'Entrepreneur': 'Self-Employed',   # Map entrepreneur to Self-Employed
                'Government': 'Government',
                'Govt': 'Government',
                'Public': 'Government',
                'Public Sector': 'Government',
                'Civil Service': 'Government',
                'Student': 'Student',
                'Studying': 'Student',
                'Retired': 'Retired',
                'Pension': 'Retired',
                'Unemployed': 'Student',    # Map unemployed to Student as closest match
                'Jobless': 'Student',       # Map jobless to Student as closest match
                'Not Working': 'Student',   # Map not working to Student as closest match
                'Housewife': 'Student',     # Map housewife to Student as closest match
                'Homemaker': 'Student'      # Map homemaker to Student as closest match
            }
            return employment_mapping.get(v, v)
            
        return v

    @validator('education', pre=True)
    def normalize_education_level(cls, v):
        """Normalize education level input to match dataset values."""
        if isinstance(v, str):
            v = v.strip().title()
            
            # Handle education level mapping from frontend to dataset values
            education_mapping = {
                'Masters': 'Postgraduate',
                'Master': 'Postgraduate', 
                'Masters Degree': 'Postgraduate',
                'Master Degree': 'Postgraduate',
                'Postgraduate': 'Postgraduate',
                'Graduate': 'Graduate',
                'Bachelor': 'Graduate',
                'Bachelors': 'Graduate',
                'Bachelor Degree': 'Graduate',
                'Bachelors Degree': 'Graduate',
                'Diploma': 'Diploma',
                '12Th Pass': '12th Pass',
                '12Th': '12th Pass',
                '12': '12th Pass',
                '10Th Pass': '10th Pass', 
                '10Th': '10th Pass',
                '10': '10th Pass',
                'Phd': 'PhD',
                'Ph.D': 'PhD',
                'Ph.D.': 'PhD',
                'Doctorate': 'PhD'
            }
            return education_mapping.get(v, v)
            
        return v


class EMICalculationRequest(BaseModel):
    loan_amount: float = Field(..., gt=0, description="Loan amount in currency")
    interest_rate: float = Field(..., ge=0, le=50, description="Annual interest rate (percentage)")
    tenure_months: int = Field(..., ge=1, le=360, description="Loan tenure in months")
    monthly_income: Optional[float] = Field(None, gt=0, description="Monthly income for affordability analysis")


class EMICalculationResponse(BaseModel):
    loan_amount: float
    interest_rate: float
    tenure_months: int
    monthly_emi: float
    total_amount_payable: float
    total_interest_payable: float
    emi_to_income_ratio: Optional[float] = None
    affordability_analysis: Optional[str] = None


class LoanResponse(BaseModel):
    eligibility_status: str
    recommended_product_type: str
    optimal_loan_amount: float
    tenure_months: int
    interest_rate: float
    eligibility_probability: float
    monthly_emi: float
    total_amount_payable: Optional[float] = 0.0
    total_interest_payable: Optional[float] = 0.0
    emi_to_income_ratio: Optional[float] = 0.0
    recommendations: Optional[list] = []


# --- API ENDPOINTS ---
@app.get("/", tags=["Health"])
async def root():
    return {"message": "CogniML Loan Recommendation API is running."}


@app.get("/health", tags=["Health"])
async def health_check():
    db_stats = cibil_db.get_cibil_stats()
    return {
        "status": "healthy",
        "models_loaded": len(models) == 5,
        "database_status": "connected" if db_stats.get('total_records', 0) > 0 else "connected_empty",
        "cibil_records": db_stats.get('total_records', 0)
    }


@app.post("/predict", response_model=LoanResponse, tags=["Prediction"])
async def predict_loan(request: LoanRequest):
    """
    Validates CIBIL ID, fetches score, and generates a single loan recommendation.
    """
    cibil_score = cibil_db.get_cibil_score(request.cibil_id)
    if cibil_score is None:
        raise HTTPException(status_code=404, detail=f"CIBIL ID '{request.cibil_id}' not found.")

    try:
        recommendation = generate_loan_recommendation(request, cibil_score)
        return LoanResponse(**recommendation)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction error for CIBIL ID {request.cibil_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal error during prediction.")


@app.post("/batch-predict", tags=["Prediction"])
async def batch_predict(requests: list[LoanRequest]):
    """
    Process multiple loan applications at once (max 10 per batch).
    """
    if len(requests) > 10:
        raise HTTPException(status_code=400, detail="Batch size cannot exceed 10.")

    results = []
    for i, request in enumerate(requests):
        try:
            cibil_score = cibil_db.get_cibil_score(request.cibil_id)
            if cibil_score is None:
                raise ValueError(f"CIBIL ID '{request.cibil_id}' not found.")

            recommendation = generate_loan_recommendation(request, cibil_score)
            results.append({"request_id": i, "status": "success", "data": recommendation})
        except Exception as e:
            results.append({"request_id": i, "status": "error", "error": str(e)})

    return {"results": results}


@app.get("/model-info", tags=["Info"])
async def get_model_info():
    """Get information about the loaded ML models."""
    return {
        "models_loaded": list(models.keys()),
        "label_encoders_loaded": list(label_encoders.keys()),
    }


@app.get("/valid-values", tags=["Info"])
async def get_valid_categorical_values():
    """Get all valid values for categorical fields."""
    try:
        valid_values = {}
        for encoder_name, encoder in label_encoders.items():
            valid_values[encoder_name] = encoder.classes_.tolist()
        
        # Add education level mapping for frontend reference
        valid_values["Education Level Mapping"] = {
            "Accepted frontend values": ["masters", "master", "graduate", "bachelor", "diploma", "12th pass", "10th pass", "phd"],
            "Mapped to dataset values": ["Postgraduate", "Graduate", "Diploma", "12th Pass", "10th Pass", "PhD"]
        }
        
        # Add employment status mapping for frontend reference
        valid_values["Employment Status Mapping"] = {
            "Accepted frontend values": ["salaried", "self-employed", "unemployed", "student", "retired", "government"],
            "Mapped to dataset values": ["Salaried", "Self-Employed", "Student", "Student", "Retired", "Government"],
            "Note": "unemployed/jobless are mapped to Student as closest available category"
        }
        
        return {"valid_categorical_values": valid_values}
    except Exception as e:
        logger.error(f"Error getting valid values: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving valid categorical values")


@app.post("/calculate-emi", response_model=EMICalculationResponse, tags=["Financial Tools"])
async def calculate_emi_endpoint(request: EMICalculationRequest):
    """
    Calculate EMI, total payment, and interest for given loan parameters.
    Includes affordability analysis if monthly income is provided.
    """
    try:
        # Calculate EMI using the proper formula
        monthly_emi = calculate_emi(request.loan_amount, request.interest_rate, request.tenure_months)
        total_amount_payable = monthly_emi * request.tenure_months
        total_interest_payable = total_amount_payable - request.loan_amount
        
        # Calculate EMI to income ratio if income provided
        emi_to_income_ratio = None
        affordability_analysis = None
        
        if request.monthly_income:
            emi_to_income_ratio = (monthly_emi / request.monthly_income) * 100
            
            if emi_to_income_ratio > 40:
                affordability_analysis = "High risk: EMI exceeds 40% of income"
            elif emi_to_income_ratio > 30:
                affordability_analysis = "Moderate: EMI is manageable but monitor expenses"
            else:
                affordability_analysis = "Low risk: EMI is well within affordable limits"
        
        return EMICalculationResponse(
            loan_amount=request.loan_amount,
            interest_rate=request.interest_rate,
            tenure_months=request.tenure_months,
            monthly_emi=round(monthly_emi, 2),
            total_amount_payable=round(total_amount_payable, 2),
            total_interest_payable=round(total_interest_payable, 2),
            emi_to_income_ratio=round(emi_to_income_ratio, 2) if emi_to_income_ratio else None,
            affordability_analysis=affordability_analysis
        )
        
    except Exception as e:
        logger.error(f"Error in EMI calculation: {e}")
        raise HTTPException(status_code=500, detail="Error calculating EMI")


@app.get("/cibil-stats", tags=["Info"])
async def get_cibil_statistics():
    """Get statistics of the CIBIL scores in the database."""
    stats = cibil_db.get_cibil_stats()
    if not stats or stats.get('total_records') == 0:
        raise HTTPException(status_code=404, detail="No CIBIL data in database.")
    return stats


@app.post("/retrain", tags=["Model Management"])
async def retrain_models():
    """
    (Placeholder) Triggers a retraining of all models.
    NOTE: In a real-world scenario, this would be a long-running background task.
    """
    if not os.path.exists('merged_training_dataset.csv'):
        raise HTTPException(status_code=400, detail="Training dataset not found.")

    logger.info("Starting model retraining...")
    # In a real app, you would use Celery/RQ to run this in the background
    # For this example, we run it directly (will block the server)
    try:
        import ml  # Import the ml module
        ml.train_and_save_models()  # Call the training function
        load_ml_models()  # Reload models into memory after training
        return {"message": "Models retrained successfully. Models have been reloaded."}
    except ImportError:
        logger.error("ml.py module not found")
        raise HTTPException(status_code=500, detail="Training module not available")
    except Exception as e:
        logger.error(f"Error during retraining: {e}")
        raise HTTPException(status_code=500, detail=f"Retraining failed: {e}")


# --- CUSTOM EXCEPTION HANDLERS ---
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"error": "An unexpected internal server error occurred."})


# --- MAIN EXECUTION BLOCK ---
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
