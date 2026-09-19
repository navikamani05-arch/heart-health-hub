import unittest
import sys
import os
from datetime import datetime, timezone
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.report_generator import generate_pdf_report


class TestReportGenerator(unittest.TestCase):

    def setUp(self):
        self.username = "testuser"
        self.timestamp = datetime.now(timezone.utc)
        self.risk_score = 72.5
        self.risk_category = "Higher Risk"
        self.input_summary = "BMI: 30, AgeGrp: 10, GenHlth: 4"
        self.top_shap = {
            "Stroke": 1.007,
            "Sex": 0.898,
            "Age": 0.875,
            "HighBP": 0.612,
            "GenHlth": 0.543,
        }
        self.recommendations = [
            "Your input indicates elevated blood pressure.",
            "General wellness practices include balanced nutrition.",
        ]

    def test_pdf_bytes_returned(self):
        """generate_pdf_report must return non-empty bytes."""
        pdf_bytes = generate_pdf_report(
            username=self.username,
            timestamp=self.timestamp,
            risk_score=self.risk_score,
            risk_category=self.risk_category,
            input_summary=self.input_summary,
            top_shap_features=self.top_shap,
            recommendations=self.recommendations,
        )
        self.assertIsInstance(pdf_bytes, bytes)
        self.assertGreater(len(pdf_bytes), 1000, "PDF output is suspiciously small")

    def test_pdf_header_magic_bytes(self):
        """Output should start with the PDF magic bytes %PDF."""
        pdf_bytes = generate_pdf_report(
            username=self.username,
            timestamp=self.timestamp,
            risk_score=self.risk_score,
            risk_category=self.risk_category,
            input_summary=self.input_summary,
            top_shap_features=self.top_shap,
            recommendations=self.recommendations,
        )
        self.assertTrue(pdf_bytes.startswith(b'%PDF'), "Output is not a valid PDF")

    def test_pdf_with_shap_image(self):
        """PDF generation should succeed even when SHAP image path is provided."""
        shap_path = 'images/explainability/local_waterfall.png'
        pdf_bytes = generate_pdf_report(
            username=self.username,
            timestamp=self.timestamp,
            risk_score=self.risk_score,
            risk_category=self.risk_category,
            input_summary=self.input_summary,
            top_shap_features=self.top_shap,
            recommendations=self.recommendations,
            shap_image_path=shap_path if os.path.exists(shap_path) else None,
        )
        self.assertTrue(pdf_bytes.startswith(b'%PDF'))

    def test_pdf_missing_image_handled_gracefully(self):
        """PDF generation should not crash when shap_image_path doesn't exist."""
        pdf_bytes = generate_pdf_report(
            username=self.username,
            timestamp=self.timestamp,
            risk_score=self.risk_score,
            risk_category=self.risk_category,
            input_summary=self.input_summary,
            top_shap_features=self.top_shap,
            recommendations=self.recommendations,
            shap_image_path='/nonexistent/path/image.png',
        )
        self.assertTrue(pdf_bytes.startswith(b'%PDF'))


if __name__ == '__main__':
    unittest.main()
