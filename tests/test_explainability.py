import unittest
import pandas as pd
import numpy as np
import os
import joblib

from ml.explainability import generate_local_explanation, get_explainer

class TestExplainability(unittest.TestCase):

    def setUp(self):
        # Create a single mock patient record
        self.features = ['HighBP', 'HighChol', 'CholCheck', 'BMI', 'Smoker', 'Stroke', 'Diabetes', 
                         'PhysActivity', 'Fruits', 'Veggies', 'HvyAlcoholConsump', 'AnyHealthcare', 
                         'NoDocbcCost', 'GenHlth', 'MentHlth', 'PhysHlth', 'DiffWalk', 'Sex', 'Age', 
                         'Education', 'Income']
        self.patient_data = pd.DataFrame([[1, 1, 1, 30, 1, 0, 2, 0, 0, 0, 0, 1, 0, 4, 15, 10, 1, 0, 10, 4, 5]], columns=self.features)

    def test_explainer_initialization(self):
        explainer, model, scaler = get_explainer()
        self.assertIsNotNone(explainer)
        self.assertIsNotNone(model)
        self.assertIsNotNone(scaler)

    def test_generate_local_explanation(self):
        res = generate_local_explanation(self.patient_data)
        
        # Check output structure
        self.assertIn('risk_score', res)
        self.assertIn('contributions', res)
        self.assertIn('base_value', res)
        self.assertIn('disclaimer', res)
        
        # Risk score is a float
        self.assertIsInstance(res['risk_score'], float)
        
        # Contributions dictionary matches features
        self.assertEqual(len(res['contributions']), len(self.features))
        
        # Ensure image was created
        self.assertTrue(os.path.exists('images/explainability/local_waterfall.png'))

if __name__ == '__main__':
    unittest.main()
