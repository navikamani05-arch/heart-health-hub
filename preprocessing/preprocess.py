import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
import joblib
import os

def load_data(filepath='dataset/heart_disease_health_indicators_BRFSS2015.csv'):
    """Loads the dataset."""
    df = pd.read_csv(filepath)
    return df

def get_preprocessed_data(df, model_type='linear', test_size=0.2, random_state=42):
    """
    Preprocesses the dataset:
    1. Train/Test split (before any scaling/SMOTE to prevent data leakage)
    2. Scales numerical features if model_type requires it ('linear' or 'distance')
    3. Applies SMOTE only to the training set to handle class imbalance
    
    Args:
        df: Pandas dataframe.
        model_type: 'linear' (requires scaling) or 'tree' (does not require scaling).
        test_size: Proportion of dataset to include in the test split.
        random_state: Seed for reproducibility.
        
    Returns:
        X_train_res, X_test, y_train_res, y_test
    """
    X = df.drop(columns=['HeartDiseaseorAttack'])
    y = df['HeartDiseaseorAttack']
    
    # 1. Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, stratify=y, random_state=random_state)
    
    # Identify continuous/ordinal numerical features that may need scaling
    # Binary features are already 0/1. 
    # Continuous/Ordinal in BRFSS: BMI, GenHlth, MentHlth, PhysHlth, Age, Education, Income
    numerical_cols = ['BMI', 'GenHlth', 'MentHlth', 'PhysHlth', 'Age', 'Education', 'Income']
    
    # We will operate on copies to avoid SettingWithCopyWarning
    X_train = X_train.copy()
    X_test = X_test.copy()
    
    if model_type in ['linear', 'distance']:
        scaler = StandardScaler()
        # Fit on training data ONLY
        X_train[numerical_cols] = scaler.fit_transform(X_train[numerical_cols])
        # Transform test data
        X_test[numerical_cols] = scaler.transform(X_test[numerical_cols])
        
        # Save scaler for future inference
        os.makedirs('models', exist_ok=True)
        joblib.dump(scaler, 'models/scaler.joblib')
        print("Scaler saved to models/scaler.joblib")
    elif model_type == 'tree':
        # Tree-based models (Random Forest, Decision Tree, XGBoost) do not require feature scaling
        pass
    else:
        raise ValueError("model_type must be 'linear', 'distance', or 'tree'")

    # 2. Apply SMOTE to training data ONLY
    smote = SMOTE(random_state=random_state)
    X_train_res, y_train_res = smote.fit_resample(X_train, y_train)
    
    return X_train_res, X_test, y_train_res, y_test

if __name__ == "__main__":
    df = load_data()
    X_train_res, X_test, y_train_res, y_test = get_preprocessed_data(df, model_type='linear')
    print(f"Original Train shape: {int(df.shape[0] * 0.8)} | Resampled Train shape: {X_train_res.shape[0]}")
    print(f"Test shape: {X_test.shape[0]}")
    
    print("\nClass distribution in resampled train set:")
    print(y_train_res.value_counts())
