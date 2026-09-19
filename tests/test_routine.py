import unittest
import sys
import os

# Add root directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ml.routine import generate_personalized_routine
from fastapi.testclient import TestClient
from api.main import app


class TestWellnessRoutine(unittest.TestCase):
    def setUp(self):
        self.sample_inputs = {
            'HighBP': 1,
            'HighChol': 1,
            'CholCheck': 1,
            'BMI': 28.5,
            'Smoker': 1,
            'Stroke': 0,
            'Diabetes': 1,
            'PhysActivity': 0,
            'Fruits': 0,
            'Veggies': 1,
            'HvyAlcoholConsump': 0,
            'AnyHealthcare': 1,
            'NoDocbcCost': 0,
            'GenHlth': 4,
            'MentHlth': 10,
            'PhysHlth': 5,
            'DiffWalk': 0,
            'Sex': 1,
            'Age': 9,
            'Education': 5,
            'Income': 6
        }
        self.risk_score = 45.2
        self.top_shap = {'HighBP': 0.45, 'BMI': 0.32, 'GenHlth': 0.28}
        self.client = TestClient(app)

    def test_routine_generation_structure(self):
        """Verify routine contains all required sections and 3-5 daily goals."""
        routine = generate_personalized_routine(
            self.sample_inputs, self.risk_score, self.top_shap, lang='en'
        )

        required_keys = [
            'morning_routine', 'afternoon_routine', 'evening_routine',
            'night_routine', 'physical_activity', 'healthy_eating',
            'hydration_reminder', 'stress_relaxation', 'sleep_routine',
            'daily_goals', 'disclaimer'
        ]
        for key in required_keys:
            self.assertIn(key, routine)
            self.assertTrue(len(str(routine[key])) > 0)

        # Verify daily goals count between 3 and 5
        self.assertGreaterEqual(len(routine['daily_goals']), 3)
        self.assertLessEqual(len(routine['daily_goals']), 5)

    def test_bilingual_output(self):
        """Verify routine produces distinct non-empty strings in English and Tamil."""
        routine_en = generate_personalized_routine(
            self.sample_inputs, self.risk_score, self.top_shap, lang='en'
        )
        routine_ta = generate_personalized_routine(
            self.sample_inputs, self.risk_score, self.top_shap, lang='ta'
        )

        self.assertNotEqual(routine_en['morning_routine'], routine_ta['morning_routine'])
        self.assertIn("Morning:", routine_en['morning_routine'])
        self.assertIn("காலை:", routine_ta['morning_routine'])

    def test_safe_wording_no_medical_claims(self):
        """Verify recommendations and disclaimers do not make diagnostic/curative claims."""
        for lang in ['en', 'ta']:
            routine = generate_personalized_routine(
                self.sample_inputs, self.risk_score, self.top_shap, lang=lang
            )
            full_text = " ".join([
                routine['morning_routine'],
                routine['physical_activity'],
                routine['healthy_eating'],
                routine['hydration_reminder'],
                routine['stress_relaxation'],
                routine['evening_routine'],
                routine['sleep_routine'],
                " ".join(routine['daily_goals'])
            ]).lower()

            prohibited_english = ['diagnosis', 'prescribe', 'medication', 'cure heart disease', 'treat disease']
            if lang == 'en':
                for term in prohibited_english:
                    self.assertNotIn(term, full_text)

            # Ensure disclaimer is non-empty and contains safety warning
            self.assertTrue(len(routine['disclaimer']) > 20)

    def test_missing_or_invalid_inputs(self):
        """Verify handling of empty or missing inputs gracefully without crashing."""
        routine_empty = generate_personalized_routine({}, 0.0, {}, lang='en')
        self.assertIn('morning_routine', routine_empty)
        self.assertTrue(len(routine_empty['daily_goals']) >= 3)

        routine_none = generate_personalized_routine(
            {'BMI': None, 'HighBP': None}, 50.0, {}, lang='en'
        )
        self.assertIn('physical_activity', routine_none)

    def test_api_routine_endpoint(self):
        """Test POST /api/routine/generate FastAPI route."""
        payload = {
            "patient_inputs": self.sample_inputs,
            "risk_score": self.risk_score,
            "top_shap_features": self.top_shap,
            "lang": "en"
        }
        res = self.client.post("/api/routine/generate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("morning_routine", data)
        self.assertIn("daily_goals", data)


if __name__ == '__main__':
    unittest.main()
