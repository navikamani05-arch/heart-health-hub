import unittest
import sys
import os
from datetime import datetime, timezone

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.i18n import t, get_all_keys, clear_cache, _load
from ml.recommendations import generate_recommendations
from utils.report_generator import generate_pdf_report, tamil_font_available


class TestBilingualSupport(unittest.TestCase):

    def setUp(self):
        clear_cache()

    def test_json_files_exist_and_load(self):
        """Verify both en.json and ta.json load properly."""
        en_dict = _load('en')
        ta_dict = _load('ta')

        self.assertGreater(len(en_dict), 50, "en.json has surprisingly few keys")
        self.assertGreater(len(ta_dict), 50, "ta.json has surprisingly few keys")

    def test_translation_key_parity(self):
        """Ensure all keys in en.json exist in ta.json."""
        en_keys = get_all_keys('en')
        ta_keys = get_all_keys('ta')

        missing_in_ta = en_keys - ta_keys
        self.assertEqual(
            len(missing_in_ta), 0,
            f"Keys present in en.json but missing in ta.json: {missing_in_ta}"
        )

    def test_translation_function(self):
        """Test t() helper function for English and Tamil lookups."""
        en_title = t('auth.title', lang='en')
        ta_title = t('auth.title', lang='ta')

        self.assertEqual(en_title, "🔐 Authentication")
        self.assertEqual(ta_title, "🔐 அங்கீகாரம்")

    def test_formatting_placeholders(self):
        """Test placeholder interpolation in t()."""
        en_res = t('home.title', lang='en', username="Navika")
        ta_res = t('home.title', lang='ta', username="நவிகா")

        self.assertIn("Navika", en_res)
        self.assertIn("நவிகா", ta_res)

    def test_fallback_behavior(self):
        """Test fallback when key or lang is missing."""
        fallback = t('non_existent_key_12345', lang='en')
        self.assertEqual(fallback, 'non_existent_key_12345')

    def test_recommendations_bilingual(self):
        """Verify recommendations produce translation keys that resolve in both languages."""
        inputs = {'HighBP': 1, 'BMI': 32, 'Smoker': 1}
        keys = generate_recommendations(inputs)

        for k in keys:
            en_text = t(k, lang='en')
            ta_text = t(k, lang='ta')
            self.assertNotEqual(en_text, k, f"Key {k} not translated in English")
            self.assertNotEqual(ta_text, k, f"Key {k} not translated in Tamil")
            self.assertNotEqual(en_text, ta_text, f"Key {k} has identical English and Tamil text")

    def test_pdf_generation_bilingual(self):
        """Test PDF generation in both English and Tamil."""
        timestamp = datetime.now(timezone.utc)
        top_shap = {"Stroke": 1.007, "HighBP": 0.612}
        recs_en = [t('rec.highbp', lang='en'), t('rec.bmi.obese', lang='en')]
        recs_ta = [t('rec.highbp', lang='ta'), t('rec.bmi.obese', lang='ta')]

        pdf_en = generate_pdf_report(
            username="TestUser",
            timestamp=timestamp,
            risk_score=65.0,
            risk_category="Moderate Risk",
            input_summary="BMI: 32, HighBP: 1",
            top_shap_features=top_shap,
            recommendations=recs_en,
            lang='en'
        )
        self.assertTrue(pdf_en.startswith(b'%PDF'), "English PDF generation failed")

        pdf_ta = generate_pdf_report(
            username="சோதனையாளி",
            timestamp=timestamp,
            risk_score=65.0,
            risk_category="மிதமான அபாயம்",
            input_summary="BMI: 32, HighBP: 1",
            top_shap_features=top_shap,
            recommendations=recs_ta,
            lang='ta'
        )
        self.assertTrue(pdf_ta.startswith(b'%PDF'), "Tamil PDF generation failed")

    def test_tamil_font_status(self):
        """Check if NotoSansTamil font registered correctly."""
        self.assertTrue(tamil_font_available(), "NotoSansTamil font should be registered and available")


if __name__ == '__main__':
    unittest.main()
