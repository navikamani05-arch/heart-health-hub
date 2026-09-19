# CardioRisk: Preventive Heart Disease Risk Assessment Platform with Explainable AI

CardioRisk is a production-quality, portfolio-grade preventive heart disease risk assessment web platform built with Python, Streamlit, Scikit-Learn, SHAP, and SQLAlchemy. It evaluates patient lifestyle and health parameters to estimate a non-clinical risk score while offering Explainable AI (XAI) insights into key contributing factors.

---

## 📌 Problem Statement

Cardiovascular diseases (CVDs) are the leading cause of mortality globally. Early detection of modifiable risk factors (e.g., high blood pressure, elevated cholesterol, physical inactivity, smoking) is crucial for preventive healthcare. Traditional risk tools often lack interpretability or user accessibility. CardioRisk bridges this gap by providing an accessible, transparent, and educational risk estimation tool backed by Explainable AI (SHAP).

---

## 🎯 Project Objectives

1. **Machine Learning Comparison:** Train and compare multiple baseline algorithms on the CDC BRFSS 2015 dataset using balanced resampling strategies.
2. **Recall-Optimized Modeling:** Prioritize Recall and ROC-AUC over raw accuracy to minimize False Negatives in preventive screening.
3. **Explainable AI (XAI):** Integrate SHAP (SHapley Additive exPlanations) to explain global feature importance and individual prediction drivers.
4. **Full-Stack Architecture:** Implement user authentication, persistent patient history (SQLite + SQLAlchemy), health goal tracking, and downloadable bilingual PDF reports.
5. **Bilingual Support:** Provide complete English and Tamil (தமிழ்) internationalization (UI, recommendations, and PDF generation).
6. **Medical Safety & Non-Diagnosis:** Ensure clear, unambiguous disclaimers that predictions are model-estimated scores for educational research, not clinical diagnoses.

---

## 📊 Dataset & Statistics

- **Source:** Behavioral Risk Factor Surveillance System (BRFSS 2015) by CDC.
- **Total Records:** 253,680 survey responses.
- **Target Variable:** `HeartDiseaseorAttack` (Binary: 0 = No, 1 = Yes).
- **Class Imbalance:** ~90.6% Negative (229,787), ~9.4% Positive (23,893).
- **Features:** 21 health indicator features (Demographics, Vitals, History, Lifestyle).

---

## 🔬 ML Algorithms Compared & Selection

All models were evaluated on a fixed 20% stratified hold-out test set (n=50,736) using SMOTE applied exclusively to the training set:

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** (Selected) | 75.47% | 24.75% | **78.66%** | **0.3766** | **0.8451** |
| **Linear SVM** | 75.46% | 24.75% | **78.66%** | 0.3765 | 0.8447 |
| **Naive Bayes** | 72.03% | 21.75% | 75.79% | 0.3380 | 0.7903 |
| **KNN** | 77.18% | 22.42% | 57.86% | 0.3232 | 0.7426 |
| **Decision Tree** | 84.94% | 24.61% | 29.00% | 0.2663 | 0.6002 |
| **Random Forest** | 89.88% | 39.46% | 13.83% | 0.2048 | 0.8099 |

**Selection Justification:**
Logistic Regression was selected as the optimal baseline model because it achieved the highest **Recall (78.66%)** and **ROC-AUC (0.8451)**. In preventive screening, missing a high-risk patient (False Negative) carries far higher cost than a False Positive. Random Forest achieved high overall accuracy (89.88%) by predicting the majority class, but missed 86.17% of positive cases.

---

## 💡 Explainable AI (SHAP)

- **Global Feature Importance:** `shap.LinearExplainer` reveals `GenHlth` (General Health rating), `HighBP` (High Blood Pressure), `Age`, `Stroke`, and `CholCheck` as the strongest population-level drivers.
- **Local Individual Explanations:** For every patient submission, SHAP calculates feature-level mathematical contributions and renders a local waterfall plot explaining why the model-estimated score deviated from the baseline prior.

---

## 🏗️ System Architecture

```text
[ BRFSS 2015 Dataset ]
        │
        ▼
[ Preprocessing Pipeline ]  ──►  StandardScaler (Linear Models) / Scale-Invariant (Trees)
        │
        ▼  (Training-Only SMOTE)
[ Model Training & Selection ]  ──►  Logistic Regression (best_model.joblib)
        │
        ▼
[ SHAP Explainability Engine ]  ──►  LinearExplainer + Local Waterfall Plots
        │
        ▼
[ Streamlit Web Platform ]
 ├── Auth Manager (bcrypt)
 ├── Session State & i18n (EN/TA)
 ├── SQLite DB (SQLAlchemy)
 └── PDF Generator (ReportLab + NotoSansTamil)
```

---

## 🛠️ Technology Stack

- **Core Language:** Python 3.12+
- **Data & ML:** Pandas, NumPy, Scikit-learn, Imbalanced-learn, SHAP, Joblib
- **Web Interface:** Streamlit
- **Database & Auth:** SQLite, SQLAlchemy, bcrypt
- **Reporting & Fonts:** ReportLab, Google Noto Sans Tamil TTF
- **Testing:** Python `unittest` framework

---

## 📂 Project Structure

```text
CardioRisk/
├── .streamlit/
│   └── config.toml          # Streamlit production configuration
├── auth/
│   └── auth_manager.py      # bcrypt password hashing & authentication
├── database/
│   ├── cardiorisk.db        # SQLite database
│   ├── db_config.py         # SQLAlchemy engine & session configuration
│   ├── init_db.py           # Database initializer script
│   └── models.py            # User, Prediction, and HealthGoal ORM models
├── eda/
│   └── eda_analysis.py      # Exploratory data analysis & visualization script
├── fonts/
│   └── NotoSansTamil-Regular.ttf  # TrueType font for Tamil PDF generation
├── images/
│   ├── eda/                 # Saved EDA plots
│   ├── explainability/      # SHAP global & local waterfall plots
│   └── models/              # Model comparison charts
├── ml/
│   ├── explainability.py    # SHAP explainer module
│   ├── recommendations.py  # Rule-based wellness suggestion key generator
│   └── train_model.py       # Model training, comparison, & evaluation script
├── models/
│   ├── best_model.joblib    # Serialized Logistic Regression model
│   ├── model_metrics.json   # Winning model evaluation metrics
│   └── scaler.joblib        # Fitted StandardScaler for inference
├── preprocessing/
│   └── preprocess.py        # Stratified split, scaling, & training-only SMOTE
├── reports/
│   ├── confusion_matrices.json  # Model confusion matrix data
│   └── model_comparison.csv     # Model evaluation comparison metrics
├── tests/
│   ├── test_app.py          # Streamlit UI tests
│   ├── test_audit.py        # End-to-end integration, security, & audit tests
│   ├── test_db_auth.py      # Database & authentication unit tests
│   ├── test_explainability.py # SHAP module unit tests
│   ├── test_i18n.py         # Bilingual key parity & PDF unit tests
│   ├── test_model.py        # Saved model inference unit tests
│   ├── test_preprocessing.py # Preprocessing & SMOTE pipeline tests
│   ├── test_recommendations.py # Wellness suggestion tests
│   └── test_report.py       # PDF report generator unit tests
├── translations/
│   ├── en.json              # English translation dictionary (95+ keys)
│   └── ta.json              # Tamil translation dictionary (95+ keys)
├── utils/
│   ├── i18n.py              # Internationalization helper
│   └── report_generator.py  # ReportLab PDF report generator
├── app.py                   # Main Streamlit web application
├── README.md                # Project documentation
└── requirements.txt         # Project dependencies
```

---

## ⚡ Installation & Execution Instructions

1. **Clone or Navigate to the Workspace:**
   ```bash
   cd "C:\DS Project\CardioRisk"
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Initialize Database:**
   ```bash
   python database\init_db.py
   ```

4. **Run Unit & Integration Tests:**
   ```bash
   python -m unittest discover -s tests -p "test_*.py" -v
   ```

5. **Launch the Application:**
   ```bash
   streamlit run app.py
   ```

---

## 🔍 Research Gap & Future Scope

- **Research Gap:** Existing healthcare predictive models are frequently deployed as opaque "black-box" systems without clear patient-facing explanation or localized language support, reducing patient trust and accessibility. CardioRisk demonstrates how XAI and multi-language support can be seamlessly integrated into a preventive health workflow.
- **Future Scope:**
  1. Integration of post-SMOTE Platt Scaling / Isotonic Calibration to convert model-estimated scores into clinical probabilities.
  2. Integration with Electronic Health Record (EHR) systems via FHIR standards.
  3. Support for additional regional languages (e.g., Hindi, Telugu, Malayalam).

---

## ⚠️ Medical Disclaimer

**IMPORTANT:** This software application is strictly for educational and research purposes. It does NOT constitute a medical diagnosis, clinical assessment, treatment plan, or medical recommendation. The "Risk Score" provided is a model-estimated probability based on statistical patterns in historical survey data (BRFSS 2015) and does not represent a clinically validated probability of disease. SHAP feature contributions reflect the model's internal mathematical calculations and do NOT imply direct causal medical relationships. Always seek the advice of a qualified healthcare professional regarding any health concerns or decisions.
