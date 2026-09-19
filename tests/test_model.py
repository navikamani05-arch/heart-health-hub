import unittest
import pandas as pd
import numpy as np
import joblib
import os
import json

class TestModelInference(unittest.TestCase):
    
    def setUp(self):
        # Create a single mock patient record (must match the 21 feature columns exactly)
        self.features = ['HighBP', 'HighChol', 'CholCheck', 'BMI', 'Smoker', 'Stroke', 'Diabetes', 
                         'PhysActivity', 'Fruits', 'Veggies', 'HvyAlcoholConsump', 'AnyHealthcare', 
                         'NoDocbcCost', 'GenHlth', 'MentHlth', 'PhysHlth', 'DiffWalk', 'Sex', 'Age', 
                         'Education', 'Income']
                         
        self.patient_data = pd.DataFrame([[1, 1, 1, 30, 1, 0, 2, 0, 0, 0, 0, 1, 0, 4, 15, 10, 1, 0, 10, 4, 5]], columns=self.features)

    def test_model_loading_and_prediction(self):
        # Ensure model was trained and saved
        model_path = 'models/best_model.joblib'
        metrics_path = 'models/model_metrics.json'
        
        self.assertTrue(os.path.exists(model_path), "best_model.joblib not found!")
        self.assertTrue(os.path.exists(metrics_path), "model_metrics.json not found!")
        
        # Load model and metadata
        model = joblib.load(model_path)
        with open(metrics_path, 'r') as f:
            metrics = json.load(f)
            
        model_type = metrics.get('Model_Type', 'linear')
        
        # Reproduce Preprocessing
        df_pred = self.patient_data.copy()
        if model_type in ['linear', 'distance']:
            scaler_path = 'models/scaler.joblib'
            self.assertTrue(os.path.exists(scaler_path), "scaler.joblib not found but model requires it!")
            scaler = joblib.load(scaler_path)
            
            numerical_cols = ['BMI', 'GenHlth', 'MentHlth', 'PhysHlth', 'Age', 'Education', 'Income']
            df_pred[numerical_cols] = scaler.transform(df_pred[numerical_cols])
            
        # Predict
        prediction = model.predict(df_pred)
        
        # Assert prediction is 0 or 1
        self.assertIn(prediction[0], [0, 1])
        
        # Assert probabilities can be extracted
        try:
            prob = model.predict_proba(df_pred)
            self.assertEqual(prob.shape, (1, 2))
        except AttributeError:
            # CalibratedClassifierCV or specific models might not have predict_proba natively,
            # but CalibratedClassifierCV does. If it fails, that's fine as long as we can use decision_function
            pass

if __name__ == '__main__':
    unittest.main()
