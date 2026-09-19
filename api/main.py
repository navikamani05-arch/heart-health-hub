import os
import sys
import json
import base64
import io
from datetime import datetime, timezone
from typing import Optional, Dict, Any

# Load .env file if present (keeps API keys out of source code)
from dotenv import load_dotenv
try:
    load_dotenv()
    load_dotenv('CardioRisk.env')
    load_dotenv('CardioRisk.env')
except ImportError:
    pass  # python-dotenv not installed — env vars must be set manually

from fastapi import FastAPI, HTTPException, Response, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse, StreamingResponse
from pydantic import BaseModel, EmailStr

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.db_config import SessionLocal, engine, Base
from database.models import User, Prediction, HealthGoal
from auth.auth_manager import register_user, authenticate_user
from ml.explainability import generate_local_explanation, get_feature_names, get_explainer
from ml.recommendations import generate_recommendations
from ml.routine import generate_personalized_routine
from utils.report_generator import generate_pdf_report
from utils.i18n import t, _load

# Ensure DB tables are initialized
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CardioRisk API",
    description="FastAPI Backend for CardioRisk Heart Disease Prediction Platform",
    version="1.0.0"
)

frontend_url = os.environ.get("FRONTEND_URL", "").strip()
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if frontend_url else ["*"],
    allow_credentials=True if frontend_url else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register wellness coach router
from api.wellness_coach_router import router as wellness_coach_router
app.include_router(wellness_coach_router)


# ── Pydantic Request/Response Models ──────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class PredictRequest(BaseModel):
    user_id: Optional[int] = None
    HighBP: int
    HighChol: int
    CholCheck: int
    BMI: float
    Smoker: int
    Stroke: int
    Diabetes: int
    PhysActivity: int
    Fruits: int
    Veggies: int
    HvyAlcoholConsump: int
    AnyHealthcare: int
    NoDocbcCost: int
    GenHlth: int
    MentHlth: float
    PhysHlth: float
    DiffWalk: int
    Sex: int
    Age: int
    Education: int
    Income: int

class GoalRequest(BaseModel):
    user_id: int
    goal: str

class RoutineRequest(BaseModel):
    patient_inputs: Dict[str, Any]
    risk_score: float
    top_shap_features: Dict[str, float]
    lang: Optional[str] = 'en'



# ── API Routes ────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "CardioRisk API Service is Running", "docs": "/docs"}


# 1. AUTHENTICATION

@app.post("/api/auth/register")
def api_register(req: RegisterRequest):
    success, msg = register_user(req.username, req.email, req.password)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}


@app.post("/api/auth/login")
def api_login(req: LoginRequest):
    user, msg = authenticate_user(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail=msg)
    return {
        "message": msg,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
    }


# 2. TRANSLATIONS

@app.get("/api/translations")
def get_translations():
    return {
        "en": _load("en"),
        "ta": _load("ta")
    }


# 3. PREDICTION & SHAP EXPLAINABILITY

@app.post("/api/predict")
def api_predict(req: PredictRequest):
    patient_dict = req.model_dump()
    user_id = patient_dict.pop('user_id', None)
    
    import pandas as pd
    patient_df = pd.DataFrame([patient_dict], columns=get_feature_names())
    
    try:
        explanation = generate_local_explanation(patient_df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    
    score = float(explanation['risk_score'] * 100)
    
    # Determine risk category
    if score < 30:
        category_key = "result.score.lower"
        category_en = "Lower Risk"
    elif score < 70:
        category_key = "result.score.moderate"
        category_en = "Moderate Risk"
    else:
        category_key = "result.score.higher"
        category_en = "Higher Risk"

    # Get SHAP contributions
    sorted_contribs = sorted(explanation['contributions'].items(), key=lambda item: abs(item[1]), reverse=True)
    top_shap = {k: float(v) for k, v in sorted_contribs[:5]}
    
    # Generate recommendations keys & translated versions
    feature_proxy = {k: (1 if v > 0 else 0) for k, v in top_shap.items()}
    rec_keys = generate_recommendations(feature_proxy)
    
    recs_en = [t(k, lang='en') for k in rec_keys]
    recs_ta = [t(k, lang='ta') for k in rec_keys]

    # Convert SHAP waterfall image to base64
    waterfall_img_b64 = None
    waterfall_path = 'images/explainability/local_waterfall.png'
    if os.path.exists(waterfall_path):
        with open(waterfall_path, 'rb') as f:
            waterfall_img_b64 = base64.b64encode(f.read()).decode('utf-8')

    # Save to database if user_id is provided
    pred_id = None
    if user_id:
        db = SessionLocal()
        try:
            # Map numeric codes to human-readable labels for display in History/PDF
            age_label   = t(f'pred.age.{req.Age}', lang='en')
            hlth_label  = t(f'pred.genhlth.{req.GenHlth}', lang='en')
            input_summary = f"BMI: {req.BMI}, Age: {age_label}, General Health: {hlth_label}"
            pred_record = Prediction(
                user_id=user_id,
                input_summary=input_summary,
                full_inputs=json.dumps(patient_dict),
                risk_score=score,
                risk_category=category_en,
                top_shap_features=json.dumps(top_shap)
            )
            db.add(pred_record)
            db.commit()
            db.refresh(pred_record)
            pred_id = pred_record.id
        except Exception as e:
            db.rollback()
        finally:
            db.close()

    return {
        "prediction_id": pred_id,
        "risk_score": score,
        "risk_category_en": category_en,
        "risk_category_key": category_key,
        "top_shap_features": top_shap,
        "recommendation_keys": rec_keys,
        "recommendations_en": recs_en,
        "recommendations_ta": recs_ta,
        "waterfall_image_b64": waterfall_img_b64,
        "disclaimer_en": t('disclaimer.text', lang='en'),
        "disclaimer_ta": t('disclaimer.text', lang='ta'),
    }


# 4. PREDICTION HISTORY

@app.get("/api/history/{user_id}")
def get_history(user_id: int):
    db = SessionLocal()
    try:
        preds = db.query(Prediction).filter(Prediction.user_id == user_id).order_by(Prediction.created_at.desc()).all()
        result = []
        for p in preds:
            result.append({
                "id": p.id,
                "input_summary": p.input_summary,
                "full_inputs": json.loads(p.full_inputs) if p.full_inputs else None,
                "risk_score": p.risk_score,
                "risk_category": p.risk_category,
                "top_shap_features": json.loads(p.top_shap_features),
                "created_at": p.created_at.isoformat(),
            })
        return result
    finally:
        db.close()


# 5. HEALTH GOALS

@app.get("/api/goals/{user_id}")
def get_goals(user_id: int):
    db = SessionLocal()
    try:
        goals = db.query(HealthGoal).filter(HealthGoal.user_id == user_id, HealthGoal.status == "active").all()
        return [{"id": g.id, "goal": g.goal, "status": g.status, "created_at": g.created_at.isoformat()} for g in goals]
    finally:
        db.close()


@app.post("/api/goals")
def create_goal(req: GoalRequest):
    db = SessionLocal()
    try:
        g = HealthGoal(user_id=req.user_id, goal=req.goal)
        db.add(g)
        db.commit()
        db.refresh(g)
        return {"id": g.id, "goal": g.goal, "status": g.status}
    finally:
        db.close()


@app.put("/api/goals/{goal_id}/achieve")
def achieve_goal(goal_id: int):
    db = SessionLocal()
    try:
        g = db.query(HealthGoal).filter(HealthGoal.id == goal_id).first()
        if not g:
            raise HTTPException(status_code=404, detail="Goal not found")
        g.status = "achieved"
        db.commit()
        return {"message": "Goal marked as achieved"}
    finally:
        db.close()


# 6. GLOBAL SHAP SUMMARY IMAGE

@app.get("/api/explainability/global")
def get_global_shap_image():
    img_path = 'images/explainability/global_summary.png'
    if not os.path.exists(img_path):
        raise HTTPException(status_code=404, detail="Global summary plot not found")
    return FileResponse(img_path, media_type="image/png")


# 7. PDF REPORT DOWNLOAD

@app.get("/api/reports/pdf/{prediction_id}")
def download_pdf(prediction_id: int, lang: str = Query("en")):
    db = SessionLocal()
    try:
        pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
        if not pred:
            raise HTTPException(status_code=404, detail="Prediction not found")

        user = db.query(User).filter(User.id == pred.user_id).first()
        username = user.username if user else "Patient"

        top_feats = json.loads(pred.top_shap_features)
        feature_proxy = {k: (1 if v > 0 else 0) for k, v in top_feats.items()}
        rec_keys = generate_recommendations(feature_proxy)
        recs = [t(k, lang=lang) for k in rec_keys]

        shap_img = 'images/explainability/local_waterfall.png'
        if not os.path.exists(shap_img):
            shap_img = None

        pdf_bytes = generate_pdf_report(
            username=username,
            timestamp=pred.created_at,
            risk_score=pred.risk_score,
            risk_category=pred.risk_category,
            input_summary=pred.input_summary,
            top_shap_features=top_feats,
            recommendations=recs,
            shap_image_path=shap_img,
            lang=lang
        )

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=cardiorisk_report_{prediction_id}.pdf"}
        )
    finally:
        db.close()


# ── Analytics Endpoints ───────────────────────────────────────────────────────

FEATURE_LABELS = {
    'HighBP':            'High Blood Pressure',
    'HighChol':          'High Cholesterol',
    'CholCheck':         'Cholesterol Check',
    'BMI':               'Body Mass Index (BMI)',
    'Smoker':            'Smoker',
    'Stroke':            'History of Stroke',
    'Diabetes':          'Diabetes',
    'PhysActivity':      'Physical Activity',
    'Fruits':            'Fruit Consumption',
    'Veggies':           'Vegetable Consumption',
    'HvyAlcoholConsump': 'Heavy Alcohol Use',
    'AnyHealthcare':     'Has Healthcare Coverage',
    'NoDocbcCost':       'Could Not Afford Doctor',
    'GenHlth':           'General Health Rating',
    'MentHlth':          'Poor Mental Health Days',
    'PhysHlth':          'Poor Physical Health Days',
    'DiffWalk':          'Difficulty Walking',
    'Sex':               'Sex',
    'Age':               'Age Group',
    'Education':         'Education Level',
    'Income':            'Income Level',
}


@app.get("/api/analytics/model-metrics")
def get_model_metrics():
    """Returns real model comparison metrics from the CSV produced during training."""
    import csv
    csv_path = 'reports/model_comparison.csv'
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail="Model comparison CSV not found")

    models = []
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('Model'):
                models.append({
                    'model':     row['Model'],
                    'accuracy':  round(float(row['Accuracy']) * 100, 2),
                    'precision': round(float(row['Precision']) * 100, 2),
                    'recall':    round(float(row['Recall']) * 100, 2),
                    'f1':        round(float(row['F1-score']) * 100, 2),
                    'roc_auc':   round(float(row['ROC-AUC']) * 100, 2),
                    'selected':  row['Model'] == 'Logistic Regression',
                })

    dataset_stats = {
        'total':    253680,
        'positive': 23893,
        'negative': 229787,
        'pos_pct':  9.42,
        'neg_pct':  90.58,
    }

    return {'models': models, 'dataset': dataset_stats}


@app.get("/api/analytics/shap-importance")
def get_shap_importance():
    """
    Returns top-10 feature importances for the model with readable labels.
    """
    import numpy as np
    import joblib

    try:
        model_obj = joblib.load('models/best_model.joblib')
        feat_names = get_feature_names()
        # Linear logistic regression feature importance = absolute magnitude of coefficients
        coefs = np.abs(model_obj.coef_[0])
        importance = sorted(
            [{'feature': f, 'label': FEATURE_LABELS.get(f, f), 'importance': round(float(v), 5)}
             for f, v in zip(feat_names, coefs)],
            key=lambda x: x['importance'], reverse=True
        )[:10]

        return {'features': importance}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SHAP importance retrieval failed: {str(e)}")


# 8. AI PERSONALIZED WELLNESS ROUTINE GENERATION

@app.post("/api/routine/generate")
def api_generate_routine(req: RoutineRequest):
    try:
        routine = generate_personalized_routine(
            patient_inputs=req.patient_inputs,
            risk_score=req.risk_score,
            top_shap_features=req.top_shap_features,
            lang=req.lang or 'en'
        )
        return routine
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Routine generation failed: {str(e)}")


# 9. CARDIAC CARE HOSPITAL SEARCH ENDPOINT (MULTI-STATE INDIA)

from api.hospitals import search_indian_cardiac_hospitals

@app.get("/api/cardiac-care/search")
def api_search_cardiac_care(
    query: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    pincode: Optional[str] = Query(None),
    specialty: Optional[str] = Query(None),
    emergency_only: bool = Query(False),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None)
):
    """
    Dynamically search verified Indian cardiac hospitals by location, state, district, city, pincode, specialty, or coordinates.
    """
    try:
        hospitals = search_indian_cardiac_hospitals(
            query=query,
            state=state,
            district=district,
            pincode=pincode,
            specialty=specialty,
            emergency_only=emergency_only,
            user_lat=lat,
            user_lng=lng
        )
        return {
            "count": len(hospitals),
            "query": query,
            "state": state,
            "district": district,
            "hospitals": hospitals
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hospital search failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("api.main:app", host="0.0.0.0", port=port, reload=True)

