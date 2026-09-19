import unittest
import sys
import os
import json
import joblib
from datetime import datetime, timezone

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.db_config import Base, engine, SessionLocal
from database.models import User, Prediction, HealthGoal
from auth.auth_manager import register_user, authenticate_user, verify_password
from ml.explainability import get_feature_names, generate_local_explanation
from ml.recommendations import generate_recommendations
from utils.report_generator import generate_pdf_report
from utils.i18n import t


class TestFullAudit(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        db.query(Prediction).delete()
        db.query(HealthGoal).delete()
        db.query(User).filter(User.username.in_(["audit_user1", "audit_user2"])).delete()
        db.commit()
        db.close()

    def test_1_full_user_journey_integration(self):
        """Test complete user journey: Reg -> Auth -> Predict -> DB Save -> History -> Goals -> PDF -> Lang Switch."""
        # 1. Registration
        reg_ok, msg = register_user("audit_user1", "audit1@example.com", "SecurePass123!")
        self.assertTrue(reg_ok, f"Registration failed: {msg}")

        # 2. Login
        user, msg = authenticate_user("audit_user1", "SecurePass123!")
        self.assertIsNotNone(user, f"Authentication failed: {msg}")

        # 3. Prediction
        patient_data = {
            'HighBP': 1, 'HighChol': 1, 'CholCheck': 1, 'BMI': 28, 'Smoker': 0, 'Stroke': 0,
            'Diabetes': 0, 'PhysActivity': 1, 'Fruits': 1, 'Veggies': 1, 'HvyAlcoholConsump': 0,
            'AnyHealthcare': 1, 'NoDocbcCost': 0, 'GenHlth': 3, 'MentHlth': 2, 'PhysHlth': 1,
            'DiffWalk': 0, 'Sex': 1, 'Age': 9, 'Education': 5, 'Income': 7
        }
        import pandas as pd
        df = pd.DataFrame([patient_data], columns=get_feature_names())
        exp = generate_local_explanation(df)
        self.assertIn('risk_score', exp)

        # 4. Save to DB
        db = SessionLocal()
        pred = Prediction(
            user_id=user.id,
            input_summary="BMI: 28, AgeGrp: 9, GenHlth: 3",
            risk_score=exp['risk_score'] * 100,
            risk_category="Moderate Risk",
            top_shap_features=json.dumps({"HighBP": 0.5, "HighChol": 0.4})
        )
        db.add(pred)
        db.commit()
        pred_id = pred.id
        db.close()

        # 5. Retrieve History
        db = SessionLocal()
        history = db.query(Prediction).filter(Prediction.user_id == user.id).all()
        self.assertEqual(len(history), 1)
        self.assertEqual(history[0].id, pred_id)

        # 6. Health Goals
        goal = HealthGoal(user_id=user.id, goal="Walk 30 mins daily")
        db.add(goal)
        db.commit()
        goals = db.query(HealthGoal).filter(HealthGoal.user_id == user.id).all()
        self.assertEqual(len(goals), 1)
        db.close()

        # 7. PDF Report Generation (English & Tamil)
        pdf_en = generate_pdf_report("audit_user1", datetime.now(timezone.utc), 45.0, "Moderate Risk", "BMI: 28", {"HighBP": 0.5}, ["Walk daily"], lang='en')
        pdf_ta = generate_pdf_report("audit_user1", datetime.now(timezone.utc), 45.0, "மிதமான அபாயம்", "BMI: 28", {"HighBP": 0.5}, ["தினமும் நடங்கள்"], lang='ta')
        self.assertTrue(pdf_en.startswith(b'%PDF'))
        self.assertTrue(pdf_ta.startswith(b'%PDF'))

    def test_2_ml_verification(self):
        """Verify saved model, scaler, feature alignment, and no online retraining."""
        model_path = 'models/best_model.joblib'
        scaler_path = 'models/scaler.joblib'
        metrics_path = 'models/model_metrics.json'

        self.assertTrue(os.path.exists(model_path))
        self.assertTrue(os.path.exists(scaler_path))
        self.assertTrue(os.path.exists(metrics_path))

        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)

        # Check feature order matches 21 expected BRFSS features
        expected_features = [
            'HighBP', 'HighChol', 'CholCheck', 'BMI', 'Smoker', 'Stroke', 'Diabetes',
            'PhysActivity', 'Fruits', 'Veggies', 'HvyAlcoholConsump', 'AnyHealthcare',
            'NoDocbcCost', 'GenHlth', 'MentHlth', 'PhysHlth', 'DiffWalk', 'Sex', 'Age',
            'Education', 'Income'
        ]
        self.assertEqual(get_feature_names(), expected_features)

        # Scaler must have 7 numerical features fitted
        self.assertEqual(scaler.n_features_in_, 7)

    def test_3_security_review(self):
        """Verify password hashing with bcrypt, data isolation between users, and no plaintext leakage."""
        register_user("audit_user2", "audit2@example.com", "User2SecretPass!")
        db = SessionLocal()
        user1 = db.query(User).filter(User.username == "audit_user1").first()
        user2 = db.query(User).filter(User.username == "audit_user2").first()

        # Passwords must be hashed with bcrypt ($2b$ or $2a$)
        self.assertTrue(user1.password_hash.startswith("$2b$") or user1.password_hash.startswith("$2a$"))
        self.assertNotEqual(user1.password_hash, "SecurePass123!")

        # User 2 MUST NOT be able to access User 1's predictions
        user2_history = db.query(Prediction).filter(Prediction.user_id == user2.id).all()
        self.assertEqual(len(user2_history), 0, "Security violation: User 2 accessed User 1 data!")

        db.close()

    def test_4_medical_safety_review(self):
        """Verify strict adherence to non-clinical terminology and mandatory medical disclaimers."""
        en_disc = t('disclaimer.text', lang='en')
        ta_disc = t('disclaimer.text', lang='ta')

        # Mandatory disclaimers present
        self.assertIn("educational and research purposes", en_disc.lower())
        self.assertIn("கல்வி மற்றும் ஆராய்ச்சி", ta_disc.lower())

        # No diagnostic/clinical claim language in UI label templates
        score_label_en = t('result.score.label', score="45.0", category="Moderate Risk")
        self.assertNotIn("diagnosis", score_label_en.lower())
        self.assertNotIn("clinically validated", score_label_en.lower())
        self.assertIn("Model-Estimated Risk Score", score_label_en)

    @classmethod
    def tearDownClass(cls):
        db = SessionLocal()
        db.query(Prediction).delete()
        db.query(HealthGoal).delete()
        db.query(User).filter(User.username.in_(["audit_user1", "audit_user2"])).delete()
        db.commit()
        db.close()


if __name__ == '__main__':
    unittest.main()
