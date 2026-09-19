import unittest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ml.recommendations import generate_recommendations
from utils.i18n import t


class TestRecommendations(unittest.TestCase):

    def test_high_risk_inputs_generate_suggestions(self):
        """High-risk feature values should produce multiple recommendation keys."""
        inputs = {
            'HighBP': 1, 'HighChol': 1, 'BMI': 35, 'Smoker': 1,
            'PhysActivity': 0, 'Fruits': 0, 'Veggies': 0,
            'HvyAlcoholConsump': 0, 'GenHlth': 5, 'MentHlth': 20,
            'DiffWalk': 1, 'AnyHealthcare': 0, 'Stroke': 1,
            'Diabetes': 2, 'CholCheck': 1
        }
        keys = generate_recommendations(inputs)
        self.assertGreater(len(keys), 3, "Expected multiple suggestion keys for high-risk inputs")

    def test_healthy_inputs_return_positive_message(self):
        """Minimal risk inputs should return the default positive key."""
        inputs = {
            'HighBP': 0, 'HighChol': 0, 'BMI': 22, 'Smoker': 0,
            'PhysActivity': 1, 'Fruits': 1, 'Veggies': 1,
            'HvyAlcoholConsump': 0, 'GenHlth': 1, 'MentHlth': 0,
            'DiffWalk': 0, 'AnyHealthcare': 1, 'Stroke': 0,
            'Diabetes': 0, 'CholCheck': 1
        }
        keys = generate_recommendations(inputs)
        self.assertEqual(len(keys), 1)
        self.assertEqual(keys[0], 'rec.default')

    def test_bmi_thresholds(self):
        """BMI >= 30 should give obese key, 25-29 overweight key."""
        keys_obese = generate_recommendations({'BMI': 32})
        keys_overweight = generate_recommendations({'BMI': 27})
        keys_normal = generate_recommendations({'BMI': 22})

        self.assertIn('rec.bmi.obese', keys_obese)
        self.assertIn('rec.bmi.overweight', keys_overweight)
        self.assertNotIn('rec.bmi.obese', keys_normal)
        self.assertNotIn('rec.bmi.overweight', keys_normal)

    def test_no_medical_claims_in_suggestions(self):
        """Recommendations in both languages must not contain clinical/diagnostic language."""
        forbidden_terms = ['diagnos', 'prescri', 'medicat', 'treat ', 'clinical', 'cure']
        inputs = {
            'HighBP': 1, 'HighChol': 1, 'BMI': 35, 'Smoker': 1,
            'PhysActivity': 0, 'Fruits': 0, 'Veggies': 0,
            'HvyAlcoholConsump': 1, 'GenHlth': 5, 'MentHlth': 20,
            'DiffWalk': 1, 'AnyHealthcare': 0, 'Stroke': 1,
            'Diabetes': 2,
        }
        keys = generate_recommendations(inputs)

        for lang in ['en', 'ta']:
            translated = [t(k, lang=lang) for k in keys]
            full_text = " ".join(translated).lower()
            for term in forbidden_terms:
                self.assertNotIn(term, full_text, f"Forbidden clinical term '{term}' found in {lang} recommendations")

    def test_disclaimer_text_present(self):
        """The medical disclaimer string in i18n dictionary must be non-empty in both languages."""
        en_disc = t('disclaimer.text', lang='en')
        ta_disc = t('disclaimer.text', lang='ta')

        self.assertTrue(len(en_disc) > 50)
        self.assertTrue(len(ta_disc) > 50)
        self.assertIn("educational", en_disc.lower())


if __name__ == '__main__':
    unittest.main()
