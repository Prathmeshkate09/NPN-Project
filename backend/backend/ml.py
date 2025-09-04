import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
import joblib
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def train_and_save_models(data_path='merged_training_dataset.csv'):
    """
    Loads data, trains all models for the loan recommendation system,
    and saves them to disk.
    """
    logging.info(f"Loading data from {data_path}...")
    try:
        df = pd.read_csv(data_path)
    except FileNotFoundError:
        logging.error(f"Training data file not found at {data_path}. Please ensure it is in the correct directory.")
        return

    # --- Feature Engineering and Encoding ---
    logging.info("Starting feature engineering...")
    label_encoders = {}

    # Define all categorical columns that need to be encoded
    categorical_cols = [
        'Gender', 'Marital Status', 'Type of Property (Rented/Owned)',
        'Education level', 'Employment Status', 'Product Type'
    ]

    for col in categorical_cols:
        if col not in df.columns:
            logging.error(f"Critical error: Column '{col}' not found in {data_path}. Please check your CSV file.")
            return
        le = LabelEncoder()
        df[col + '_encoded'] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le

    logging.info("Categorical features encoded successfully.")

    # --- Model Training ---

    # 1. Eligibility Model
    logging.info("Training eligibility model...")
    X_eligibility = df[[
        'Age', 'Gender_encoded', 'Marital Status_encoded', 'Type of Property (Rented/Owned)_encoded',
        'Education level_encoded', 'Employment Status_encoded', 'Experience',
        'Salary', 'CIBIL Score'
    ]]
    y_eligibility = df['Eligibility (0/1)']

    X_train, X_test, y_train, y_test = train_test_split(X_eligibility, y_eligibility, test_size=0.2, random_state=42)
    eligibility_model = RandomForestClassifier(n_estimators=100, random_state=42)
    eligibility_model.fit(X_train, y_train)
    logging.info(f"Eligibility model accuracy: {accuracy_score(y_test, eligibility_model.predict(X_test)):.2f}")
    joblib.dump(eligibility_model, 'eligibility_model.pkl')

    # Filter for eligible loans for subsequent models
    eligible_df = df[df['Eligibility (0/1)'] == 1].copy()

    base_features = [
        'Age', 'Gender_encoded', 'Marital Status_encoded', 'Type of Property (Rented/Owned)_encoded',
        'Education level_encoded', 'Employment Status_encoded', 'Experience',
        'Salary', 'CIBIL Score'
    ]

    # 2. Product Type Model
    logging.info("Training product type model...")
    X_product = eligible_df[base_features]
    y_product = eligible_df['Product Type_encoded']
    product_model = RandomForestClassifier(n_estimators=100, random_state=42)
    product_model.fit(X_product, y_product)
    joblib.dump(product_model, 'product_model.pkl')

    # 3. Loan Amount Model
    logging.info("Training loan amount model...")
    X_amount = eligible_df[base_features + ['Product Type_encoded']]
    y_amount = eligible_df['Loan Amount']
    amount_model = RandomForestRegressor(n_estimators=100, random_state=42)
    amount_model.fit(X_amount, y_amount)
    joblib.dump(amount_model, 'amount_model.pkl')

    # 4. Tenure Model
    logging.info("Training tenure model...")
    X_tenure = eligible_df[base_features + ['Product Type_encoded', 'Loan Amount']]
    # CORRECTED this column name to match your CSV
    y_tenure = eligible_df['Loan Tenure']
    tenure_model = RandomForestRegressor(n_estimators=100, random_state=42)
    tenure_model.fit(X_tenure, y_tenure)
    joblib.dump(tenure_model, 'tenure_model.pkl')

    # 5. Interest Rate Model
    logging.info("Training interest rate model...")
    # CORRECTED this column name to match your CSV
    X_rate = eligible_df[base_features + ['Product Type_encoded', 'Loan Amount', 'Loan Tenure']]
    y_rate = eligible_df['Interest Rate']
    rate_model = RandomForestRegressor(n_estimators=100, random_state=42)
    rate_model.fit(X_rate, y_rate)
    joblib.dump(rate_model, 'rate_model.pkl')

    # Save the label encoders
    joblib.dump(label_encoders, 'label_encoders.pkl')
    logging.info("All models and label encoders have been trained and saved successfully.")


if __name__ == '__main__':
    train_and_save_models()