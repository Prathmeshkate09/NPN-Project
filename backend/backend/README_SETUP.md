# CogniML Loan Recommendation API - Setup Guide

## Quick Start

### Option 1: Use the Test Script (Recommended)
```bash
python3 test_app.py
```
This will check all dependencies and files, then provide instructions.

### Option 2: Use the Startup Script
```bash
python3 start_server.py
```
This will automatically check and install dependencies, then start the server.

### Option 3: Manual Setup

1. **Install Dependencies**
```bash
pip3 install -r Requirements.txt
```

2. **Run the Application**
```bash
python3 main.py
```

3. **Access the API**
- Main API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- API docs: http://localhost:8000/redoc

## Files Required

The following files must be present:
- `main.py` - Main FastAPI application
- `Database.py` - Database module
- `ml.py` - Machine learning module
- `.env` - Environment configuration
- `Requirements.txt` - Python dependencies
- `cibil_database.csv` - CIBIL score data
- `merged_training_dataset.csv` - Training data
- **Model files (.pkl)**:
  - `eligibility_model.pkl`
  - `product_model.pkl`
  - `amount_model.pkl`
  - `tenure_model.pkl`
  - `rate_model.pkl`
  - `label_encoders.pkl`

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health check
- `POST /predict` - Single loan prediction
- `POST /batch-predict` - Batch predictions (max 10)
- `GET /model-info` - Model information
- `GET /cibil-stats` - CIBIL database statistics
- `POST /retrain` - Retrain models

## Configuration

Edit `.env` file to configure database:
```bash
# For SQLite (default)
DATABASE_URL=sqlite:///cibil_database.db

# For PostgreSQL (if needed)
DATABASE_URL=postgresql://username:password@localhost:5432/cibil_db
```

## Troubleshooting

### Common Issues:

1. **ModuleNotFoundError**: Run `pip3 install -r Requirements.txt`

2. **Database connection error**: Check `.env` file and database configuration

3. **Model files not found**: Ensure all .pkl files are present

4. **CSV files missing**: Check `cibil_database.csv` and `merged_training_dataset.csv`

### Port Issues:
If port 8000 is in use, set PORT environment variable:
```bash
export PORT=8080
python3 main.py
```

## Development

### Running Tests
```bash
python3 test_app.py
```

### Retraining Models
Send POST request to `/retrain` endpoint or run:
```bash
python3 -c "import ml; ml.train_and_save_models()"
```

## Support

If you encounter issues:
1. Run `python3 test_app.py` to diagnose problems
2. Check logs for detailed error messages
3. Ensure all required files are present
4. Verify Python version (3.8+ recommended)