import pandas as pd
import numpy as np
import joblib
import os
import shap
import matplotlib.pyplot as plt

# Ensure matplotlib doesn't try to open windows in background
import matplotlib
matplotlib.use('Agg')

def get_explainer():
    """Loads the model, scaler, and training background data, returning a SHAP explainer."""
    model = joblib.load('models/best_model.joblib')
    scaler = joblib.load('models/scaler.joblib')
    
    # We need a background dataset for the explainer. 
    # For LinearExplainer, we can pass the model and the background data directly.
    # Linear models don't strictly require background data if we pass masker=shap.maskers.Independent,
    # but providing it is safer. We'll use the model directly.
    
    # We are using LogisticRegression (which is inside best_model)
    # SHAP has a dedicated LinearExplainer
    
    explainer = shap.LinearExplainer(model, masker=shap.maskers.Independent(np.zeros((1, 21))))
    return explainer, model, scaler

def get_feature_names():
    return ['HighBP', 'HighChol', 'CholCheck', 'BMI', 'Smoker', 'Stroke', 'Diabetes', 
            'PhysActivity', 'Fruits', 'Veggies', 'HvyAlcoholConsump', 'AnyHealthcare', 
            'NoDocbcCost', 'GenHlth', 'MentHlth', 'PhysHlth', 'DiffWalk', 'Sex', 'Age', 
            'Education', 'Income']

def generate_global_shap(X_sample):
    """Generates and saves a global SHAP summary plot based on a sample of the test set."""
    explainer, _, _ = get_explainer()
    shap_values = explainer(X_sample)
    
    os.makedirs('images/explainability', exist_ok=True)
    plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values, X_sample, feature_names=get_feature_names(), show=False)
    plt.tight_layout()
    plt.savefig('images/explainability/global_summary.png')
    plt.close()
    
def generate_local_explanation(patient_df):
    """
    Generates a SHAP explanation for an individual prediction.
    patient_df: DataFrame with 1 row, containing unscaled original inputs.
    Returns the predicted probability and SHAP values dict.
    """
    explainer, model, scaler = get_explainer()
    
    # Scale numerical features exactly as during training
    numerical_cols = ['BMI', 'GenHlth', 'MentHlth', 'PhysHlth', 'Age', 'Education', 'Income']
    df_pred = patient_df.copy()
    df_pred[numerical_cols] = scaler.transform(df_pred[numerical_cols])
    
    # Get Probability
    # NOTE: Since SMOTE was used, this probability is not a true calibrated risk!
    # It must be treated strictly as an educational "risk score" and not a medical diagnosis.
    prob = model.predict_proba(df_pred)[0, 1]
    
    # Calculate SHAP values
    shap_values = explainer(df_pred)
    
    # Generate waterfall plot
    os.makedirs('images/explainability', exist_ok=True)
    plt.figure(figsize=(8, 6))
    
    # Use SHAP's exact waterfall plot
    shap.plots.waterfall(shap_values[0], show=False)
    plt.tight_layout()
    plt.savefig('images/explainability/local_waterfall.png')
    plt.close()
    
    # Extract feature contributions for UI logic
    feature_names = get_feature_names()
    contributions = {}
    for i, name in enumerate(feature_names):
        contributions[name] = shap_values.values[0][i]
        
    return {
        'risk_score': prob,
        'contributions': contributions,
        'base_value': explainer.expected_value,
        'disclaimer': "This tool is for educational/research purposes and does not replace professional medical advice. The risk percentage is a model confidence score, not a clinically validated probability."
    }

if __name__ == "__main__":
    import sys
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    from preprocessing.preprocess import load_data, get_preprocessed_data
    
    df = load_data()
    _, X_test, _, _ = get_preprocessed_data(df, model_type='linear')
    
    # Generate global summary on a sample of test set to avoid long render times
    print("Generating Global SHAP Summary...")
    generate_global_shap(X_test.sample(1000, random_state=42))
    print("Saved to images/explainability/global_summary.png")
    
    # Generate local explanation for the first patient in test set
    print("Generating Local Explanation for Patient 1...")
    # We need to un-scale it to pass to our function since our function scales it
    scaler = joblib.load('models/scaler.joblib')
    numerical_cols = ['BMI', 'GenHlth', 'MentHlth', 'PhysHlth', 'Age', 'Education', 'Income']
    
    patient = X_test.iloc[[0]].copy()
    # inverse transform to simulate raw input
    patient[numerical_cols] = scaler.inverse_transform(patient[numerical_cols])
    
    res = generate_local_explanation(patient)
    print(f"Risk Score: {res['risk_score']:.4f}")
    print("Top 3 driving features:")
    sorted_features = sorted(res['contributions'].items(), key=lambda item: abs(item[1]), reverse=True)
    for feat, val in sorted_features[:3]:
        print(f" - {feat}: {val:.4f}")
    print(res['disclaimer'])
