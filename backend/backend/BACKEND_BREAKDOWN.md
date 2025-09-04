# CogniML Backend Architecture Breakdown

## Overview
The CogniML backend is a FastAPI-based loan recommendation system that uses machine learning models to predict loan eligibility, product types, amounts, tenure, and interest rates based on user profiles and CIBIL scores.

## System Architecture

### Core Components

1. **FastAPI Application** (`main.py`)
   - REST API server with CORS middleware
   - Async context manager for startup/shutdown
   - Exception handling and logging

2. **Database Layer** (`Database/cibil_db`)
   - CIBIL score storage and retrieval
   - SQLite database with CSV data loading
   - Statistics and data management

3. **Machine Learning Pipeline**
   - 5 separate ML models for different predictions
   - Label encoders for categorical data
   - Sequential prediction workflow

## Data Flow

### 1. Application Startup
```
FastAPI App Starts → Load ML Models → Initialize Database → Check/Load CIBIL Data
```

### 2. Prediction Request Flow
```
User Request → Validate Input → Get CIBIL Score → Encode Features → 
Sequential ML Predictions → Calculate EMI → Return Response
```

### 3. ML Model Pipeline
```
Base Profile → Eligibility → Product Type → Loan Amount → Tenure → Interest Rate
```

## API Endpoints

### Health & Info Endpoints
- `GET /` - Basic health check
- `GET /health` - Detailed system status (models, database)
- `GET /model-info` - Information about loaded ML models
- `GET /cibil-stats` - CIBIL database statistics

### Prediction Endpoints
- `POST /predict` - Single loan recommendation
- `POST /batch-predict` - Batch processing (max 10 requests)

### Management Endpoints
- `POST /retrain` - Retrain all ML models (blocking operation)

## Data Models

### Input Model (LoanRequest)
```python
{
    "age": int (18-100),
    "gender": str,
    "marital_status": str,
    "property_type": str,
    "education": str,
    "employment": str,
    "experience": int (0-50),
    "salary": float (>0),
    "cibil_id": str
}
```

### Output Model (LoanResponse)
```python
{
    "eligibility_status": str,
    "recommended_product_type": str,
    "optimal_loan_amount": float,
    "tenure_months": int,
    "interest_rate": float,
    "eligibility_probability": float,
    "monthly_emi": float,
    "recommendations": list
}
```

## Machine Learning Models

### Model Types
1. **Eligibility Model** - Binary classification (eligible/not eligible)
2. **Product Model** - Multi-class classification (loan product types)
3. **Amount Model** - Regression (optimal loan amount)
4. **Tenure Model** - Regression (loan duration in months)
5. **Rate Model** - Regression (interest rate percentage)

### Sequential Prediction Logic
```python
# Step 1: Base profile creation
base_profile = [age, gender_enc, marital_enc, property_enc, 
                education_enc, employment_enc, experience, salary, cibil_score]

# Step 2: Eligibility prediction
eligibility = eligibility_model.predict(base_profile)

# Step 3: If eligible, predict product type
if eligible:
    product_type = product_model.predict(base_profile)
    
    # Step 4: Predict loan amount
    product_profile = base_profile + [product_type]
    loan_amount = amount_model.predict(product_profile)
    
    # Step 5: Predict tenure
    amount_profile = product_profile + [loan_amount]
    tenure = tenure_model.predict(amount_profile)
    
    # Step 6: Predict interest rate
    full_profile = amount_profile + [tenure]
    interest_rate = rate_model.predict(full_profile)
```

## Data Processing

### Categorical Encoding
The system uses label encoders for categorical features:
- Gender
- Marital Status
- Property Type (Rented/Owned)
- Education Level
- Employment Status
- Product Type

### Feature Normalization
- String inputs are cleaned and title-cased
- Numerical inputs are validated for ranges

## Database Integration

### CIBIL Score Management
- SQLite database stores CIBIL ID to score mappings
- Automatic CSV loading on startup if database is empty
- Statistics tracking for monitoring

### Database Operations
- `get_cibil_score(cibil_id)` - Retrieve score by ID
- `get_cibil_stats()` - Database statistics
- `init_db()` - Initialize database schema
- `load_csv_to_database()` - Bulk data loading

## Error Handling

### Exception Types
1. **Validation Errors** - Invalid input data (400)
2. **Not Found Errors** - CIBIL ID not found (404)
3. **Processing Errors** - ML prediction failures (500)
4. **System Errors** - Model loading, database issues (500)

### Error Response Format
```python
{
    "error": "Error description"
}
```

## Configuration & Environment

### Environment Variables
- `PORT` - Server port (default: 8000)

### File Dependencies
- `eligibility_model.pkl` - Eligibility prediction model
- `product_model.pkl` - Product type prediction model
- `amount_model.pkl` - Loan amount prediction model
- `tenure_model.pkl` - Tenure prediction model
- `rate_model.pkl` - Interest rate prediction model
- `label_encoders.pkl` - Categorical feature encoders
- `cibil_database.csv` - CIBIL score data
- `merged_training_dataset.csv` - Training data for retraining

## Performance Considerations

### Memory Usage
- All ML models loaded into memory at startup
- Global model storage for fast predictions
- No model caching or cleanup mechanisms

### Scalability
- Blocking retrain operation affects all requests
- No connection pooling for database
- Single-threaded model inference

### Security
- CORS allows all origins (not production-ready)
- No authentication or authorization
- No rate limiting implemented

## Deployment

### Server Configuration
- Uvicorn ASGI server
- Auto-reload enabled in development
- Host: 0.0.0.0 (all interfaces)
- Port: Configurable via environment

### Production Considerations
- Should implement background task queue for retraining
- Add authentication middleware
- Configure proper CORS policies
- Add rate limiting and monitoring
- Use connection pooling for database

## Known Issues & Limitations

1. **EMI Calculation**: Uses simple division instead of compound interest formula
2. **Model Dependencies**: Sequential predictions create error propagation
3. **Blocking Operations**: Synchronous retraining blocks entire server
4. **Security**: No authentication, open CORS policy
5. **Error Handling**: Limited error recovery mechanisms
6. **Scalability**: Single-instance design without horizontal scaling support

## Future Enhancements

1. Implement proper EMI calculation with compound interest
2. Add background task processing (Celery/Redis)
3. Implement caching layer for frequent predictions
4. Add comprehensive logging and monitoring
5. Create independent model architecture
6. Add authentication and authorization
7. Implement rate limiting and request throttling
8. Add model versioning and A/B testing capabilities