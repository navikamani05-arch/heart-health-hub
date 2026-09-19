import unittest
import sys
import os
from fastapi.testclient import TestClient

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api.main import app

class TestFastAPIBackend(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_root_endpoint(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("message", res.json())

    def test_translations_endpoint(self):
        res = self.client.get("/api/translations")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("en", data)
        self.assertIn("ta", data)

    def test_predict_endpoint(self):
        patient_data = {
            "HighBP": 1, "HighChol": 1, "CholCheck": 1, "BMI": 28.0,
            "Smoker": 0, "Stroke": 0, "Diabetes": 0, "PhysActivity": 1,
            "Fruits": 1, "Veggies": 1, "HvyAlcoholConsump": 0, "AnyHealthcare": 1,
            "NoDocbcCost": 0, "GenHlth": 3, "MentHlth": 2, "PhysHlth": 1,
            "DiffWalk": 0, "Sex": 1, "Age": 9, "Education": 5, "Income": 7
        }
        res = self.client.post("/api/predict", json=patient_data)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("risk_score", data)
        self.assertIn("top_shap_features", data)
        self.assertIn("disclaimer_en", data)

if __name__ == '__main__':
    unittest.main()
