import unittest
import os
import sys

# To allow importing from parent directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from streamlit.testing.v1 import AppTest

class TestStreamlitApp(unittest.TestCase):
    def test_app_loads_successfully(self):
        # Initialize AppTest with our script
        at = AppTest.from_file('app.py')
        
        # Run the app
        at.run(timeout=10)
        
        # Check if there are no unhandled exceptions
        self.assertFalse(at.exception, f"App raised an exception: {at.exception}")
        
        # Check if title is rendered
        self.assertTrue(len(at.title) > 0)
        self.assertEqual(at.title[0].value, "🔐 Authentication")

if __name__ == '__main__':
    unittest.main()
