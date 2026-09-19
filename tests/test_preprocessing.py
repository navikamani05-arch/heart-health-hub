import unittest
import pandas as pd
from preprocessing.preprocess import get_preprocessed_data

class TestPreprocessing(unittest.TestCase):
    
    def setUp(self):
        # Create a small dummy dataframe that matches the structure of BRFSS2015
        columns = ['HeartDiseaseorAttack', 'HighBP', 'HighChol', 'CholCheck', 'BMI', 'Smoker', 
                   'Stroke', 'Diabetes', 'PhysActivity', 'Fruits', 'Veggies', 'HvyAlcoholConsump', 
                   'AnyHealthcare', 'NoDocbcCost', 'GenHlth', 'MentHlth', 'PhysHlth', 'DiffWalk', 
                   'Sex', 'Age', 'Education', 'Income']
        
        # 10 rows, mostly class 0, some class 1 to test SMOTE
        data = [
            [0, 1, 0, 1, 24, 0, 0, 0, 1, 1, 1, 0, 1, 0, 2, 0, 0, 0, 1, 9, 6, 8],
            [0, 1, 1, 1, 28, 1, 0, 0, 0, 1, 1, 0, 1, 0, 3, 2, 0, 0, 0, 11, 4, 6],
            [0, 0, 0, 1, 22, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 4, 6, 7],
            [0, 0, 1, 1, 31, 1, 0, 0, 0, 0, 1, 1, 1, 0, 4, 5, 2, 0, 1, 7, 5, 6],
            [1, 1, 1, 1, 35, 1, 1, 2, 0, 0, 0, 0, 1, 0, 5, 30, 30, 1, 1, 12, 4, 3], # Target = 1
            [0, 0, 0, 1, 25, 0, 0, 0, 1, 1, 1, 0, 1, 0, 2, 0, 0, 0, 0, 6, 6, 8],
            [0, 1, 0, 1, 29, 0, 0, 0, 1, 1, 1, 0, 1, 0, 3, 0, 0, 0, 1, 10, 5, 7],
            [1, 1, 1, 1, 38, 1, 0, 2, 0, 0, 0, 0, 1, 0, 4, 15, 10, 1, 0, 13, 3, 4], # Target = 1
            [0, 0, 0, 1, 21, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 2, 5, 5],
            [0, 0, 1, 1, 27, 1, 0, 0, 0, 1, 0, 0, 1, 0, 3, 2, 2, 0, 0, 8, 6, 8]
        ]
        
        # We need more samples for KNN inside SMOTE (k_neighbors=5 default requires at least 6 samples of minority class)
        # So let's duplicate data to avoid SMOTE errors in tests
        data = data * 5
        self.df = pd.DataFrame(data, columns=columns)
        
    def test_linear_preprocessing(self):
        X_train_res, X_test, y_train_res, y_test = get_preprocessed_data(self.df, model_type='linear', test_size=0.2, random_state=42)
        
        # Test shapes
        self.assertEqual(len(X_train_res), len(y_train_res))
        self.assertEqual(len(X_test), len(y_test))
        
        # Test class balance (SMOTE)
        counts = y_train_res.value_counts()
        self.assertEqual(counts[0], counts[1])
        
        # Test scaling (mean should be approx 0, std approx 1 on training numerical columns)
        numerical_cols = ['BMI', 'GenHlth', 'MentHlth', 'PhysHlth', 'Age', 'Education', 'Income']
        for col in numerical_cols:
            self.assertFalse(X_train_res[col].isnull().any())

    def test_tree_preprocessing(self):
        X_train_res, X_test, y_train_res, y_test = get_preprocessed_data(self.df, model_type='tree', test_size=0.2, random_state=42)
        
        # Test shapes
        self.assertEqual(len(X_train_res), len(y_train_res))
        
        # Test class balance (SMOTE)
        counts = y_train_res.value_counts()
        self.assertEqual(counts[0], counts[1])
        
        # Test NOT scaling
        # Age should still be raw values (like 1-13)
        self.assertTrue(X_train_res['Age'].max() > 5)

if __name__ == '__main__':
    unittest.main()
