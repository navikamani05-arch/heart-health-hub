import unittest
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.db_config import Base, engine, SessionLocal
from database.models import User, Prediction, HealthGoal
from auth.auth_manager import register_user, authenticate_user
import json

class TestDBAndAuth(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        # Create tables in the test environment (using the standard db for now)
        Base.metadata.create_all(bind=engine)
        
        # Clean up users if they exist
        db = SessionLocal()
        db.query(User).filter(User.username == "testuser").delete()
        db.commit()
        db.close()

    def test_a_register_user(self):
        success, msg = register_user("testuser", "test@example.com", "SecurePass123!")
        self.assertTrue(success, f"Registration failed: {msg}")
        
        # Prevent duplicate registration
        success, msg = register_user("testuser", "test2@example.com", "SecurePass123!")
        self.assertFalse(success, "Allowed duplicate username")

    def test_b_authenticate_user(self):
        # Correct credentials
        user, msg = authenticate_user("testuser", "SecurePass123!")
        self.assertIsNotNone(user, f"Login failed: {msg}")
        self.assertEqual(user.username, "testuser")
        
        # Wrong password
        user_wrong, msg = authenticate_user("testuser", "WrongPass")
        self.assertIsNone(user_wrong, "Allowed login with wrong password")

    def test_c_prediction_history(self):
        # Authenticate first
        user, _ = authenticate_user("testuser", "SecurePass123!")
        self.assertIsNotNone(user)
        
        db = SessionLocal()
        
        # Create a mock prediction entry
        pred = Prediction(
            user_id=user.id,
            input_summary="BMI=25, HighBP=0, Age=10",
            risk_score=0.85,
            risk_category="High Risk",
            top_shap_features=json.dumps({"Stroke": 1.0, "Sex": 0.8})
        )
        
        db.add(pred)
        db.commit()
        
        # Verify it can be queried by the user
        user_preds = db.query(Prediction).filter(Prediction.user_id == user.id).all()
        self.assertEqual(len(user_preds), 1)
        self.assertEqual(user_preds[0].risk_score, 0.85)
        
        db.close()

    @classmethod
    def tearDownClass(cls):
        # Clean up database after tests
        db = SessionLocal()
        db.query(Prediction).delete()
        db.query(User).filter(User.username == "testuser").delete()
        db.commit()
        db.close()

if __name__ == '__main__':
    unittest.main()
