import pandas as pd
import numpy as np
import os
import joblib
import json
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from preprocessing.preprocess import get_preprocessed_data, load_data

def evaluate_model(name, model, X_test, y_test):
    y_pred = model.predict(X_test)
    
    # Try predict_proba for ROC-AUC, fallback to decision_function or None
    try:
        y_prob = model.predict_proba(X_test)[:, 1]
        roc_auc = roc_auc_score(y_test, y_prob)
    except AttributeError:
        roc_auc = np.nan
        
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    return {
        'Model': name,
        'Accuracy': acc,
        'Precision': prec,
        'Recall': rec,
        'F1-score': f1,
        'ROC-AUC': roc_auc,
        'Confusion_Matrix': cm.tolist()
    }

def train_and_compare_models():
    os.makedirs('models', exist_ok=True)
    os.makedirs('reports', exist_ok=True)
    os.makedirs('images/models', exist_ok=True)
    
    df = load_data()
    
    # 1. Get preprocessed data (Linear Models)
    print("Preparing linear data (scaling + SMOTE)...")
    X_train_lin, X_test_lin, y_train_lin, y_test_lin = get_preprocessed_data(df, model_type='linear')
    
    # 2. Get preprocessed data (Tree Models)
    print("Preparing tree data (SMOTE only)...")
    X_train_tree, X_test_tree, y_train_tree, y_test_tree = get_preprocessed_data(df, model_type='tree')
    
    # Define models
    # Due to massive dataset size post-SMOTE (~400k rows), we use fast approximations where necessary
    # (e.g., LinearSVC instead of kernel SVM, and limiting KNN neighbors if too slow, but default n_neighbors=5 is ok if we use n_jobs=-1)
    models = {
        'Logistic Regression': (LogisticRegression(max_iter=1000, random_state=42), 'linear'),
        'Decision Tree': (DecisionTreeClassifier(random_state=42), 'tree'),
        'Random Forest': (RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1), 'tree'), # limited estimators for speed
        'Linear SVM': (CalibratedClassifierCV(LinearSVC(random_state=42, dual=False)), 'linear'),
        'KNN': (KNeighborsClassifier(n_jobs=-1), 'linear'),
        'Naive Bayes': (GaussianNB(), 'linear')
    }
    
    results = []
    trained_models = {}
    
    for name, (model, m_type) in models.items():
        print(f"Training {name}...")
        X_train = X_train_lin if m_type == 'linear' else X_train_tree
        y_train = y_train_lin if m_type == 'linear' else y_train_tree
        X_test = X_test_lin if m_type == 'linear' else X_test_tree
        y_test = y_test_lin if m_type == 'linear' else y_test_tree
        
        # Train
        model.fit(X_train, y_train)
        trained_models[name] = model
        
        # Evaluate
        res = evaluate_model(name, model, X_test, y_test)
        results.append(res)
        print(f"{name} Results: Recall={res['Recall']:.4f}, F1={res['F1-score']:.4f}, AUC={res['ROC-AUC']:.4f}")
        
    # Create comparison table
    df_results = pd.DataFrame(results).drop(columns=['Confusion_Matrix'])
    df_results.to_csv('reports/model_comparison.csv', index=False)
    
    # Save Confusion Matrices to JSON
    cm_dict = {r['Model']: r['Confusion_Matrix'] for r in results}
    with open('reports/confusion_matrices.json', 'w') as f:
        json.dump(cm_dict, f, indent=4)
        
    # Select Best Model based on Recall (while maintaining decent F1/AUC)
    # We prioritize Recall heavily to avoid false negatives in healthcare
    best_model_name = df_results.sort_values(by='Recall', ascending=False).iloc[0]['Model']
    print(f"\nSelected Best Model: {best_model_name}")
    
    best_model = trained_models[best_model_name]
    best_model_type = models[best_model_name][1]
    
    # Save Best Model and its metadata
    joblib.dump(best_model, 'models/best_model.joblib')
    with open('models/model_metrics.json', 'w') as f:
        best_res = next(r for r in results if r['Model'] == best_model_name)
        best_res['Model_Type'] = best_model_type
        json.dump(best_res, f, indent=4)
        
    # Visualize Comparison (Recall & F1)
    df_melt = df_results.melt(id_vars=['Model'], value_vars=['Recall', 'F1-score', 'ROC-AUC', 'Accuracy'], var_name='Metric', value_name='Score')
    plt.figure(figsize=(12, 6))
    sns.barplot(data=df_melt, x='Model', y='Score', hue='Metric', palette='viridis')
    plt.title('Model Comparison Across Metrics')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('images/models/model_comparison.png')
    plt.close()
    
    print("Model training and evaluation complete.")

if __name__ == "__main__":
    train_and_compare_models()
