"""
AI Personalized Wellness Routine Generator Module

Generates a structured, non-clinical daily wellness routine based on user inputs,
lifestyle parameters, model-estimated risk score, and top SHAP contributors.

IMPORTANT MEDICAL SAFETY CONSTRAINTS:
- General wellness guidance only (nutrition, activity, sleep, hydration, stress).
- NO diagnoses, treatment plans, prescriptions, or disease-specific medical claims.
- Mandatory medical disclaimer included with every generated routine.
"""

from typing import Dict, Any, List
from utils.i18n import t


def generate_personalized_routine(
    patient_inputs: Dict[str, Any],
    risk_score: float,
    top_shap_features: Dict[str, float],
    lang: str = 'en'
) -> Dict[str, Any]:
    """
    Generates a personalized daily wellness routine and goals list.

    Args:
        patient_inputs: dict of raw patient parameters (BMI, HighBP, Smoker, PhysActivity, etc.)
        risk_score: model-estimated risk percentage (0-100)
        top_shap_features: dict of { feature_name: shap_value }
        lang: language code ('en' or 'ta')

    Returns:
        Structured dict containing routine items, daily goals, and disclaimer.
    """
    _t = lambda key, **kwargs: t(key, lang=lang, **kwargs)

    # Safely extract key variables
    bmi = float(patient_inputs.get('BMI', 25.0) or 25.0)
    high_bp = int(patient_inputs.get('HighBP', 0) or 0)
    high_chol = int(patient_inputs.get('HighChol', 0) or 0)
    smoker = int(patient_inputs.get('Smoker', 0) or 0)
    phys_act = int(patient_inputs.get('PhysActivity', 1) or 1)
    fruits = int(patient_inputs.get('Fruits', 1) or 1)
    veggies = int(patient_inputs.get('Veggies', 1) or 1)
    ment_hlth = float(patient_inputs.get('MentHlth', 0) or 0)
    gen_hlth = int(patient_inputs.get('GenHlth', 2) or 2)

    # 1. Morning Routine
    if high_bp == 1:
        morning_key = "routine.morning.bp"
    elif gen_hlth >= 4:
        morning_key = "routine.morning.gentle"
    else:
        morning_key = "routine.morning.default"

    # 2. Afternoon Routine & Physical Activity
    if phys_act == 0:
        activity_key = "routine.activity.beginner"
    elif bmi >= 30:
        activity_key = "routine.activity.lowimpact"
    else:
        activity_key = "routine.activity.active"

    if ment_hlth >= 7 or gen_hlth >= 4:
        afternoon_key = "routine.afternoon.mindful"
    else:
        afternoon_key = "routine.afternoon.active"

    # 3. Healthy Eating Suggestion
    if fruits == 0 or veggies == 0:
        eating_key = "routine.eating.produce"
    elif high_chol == 1:
        eating_key = "routine.eating.fiber"
    else:
        eating_key = "routine.eating.balanced"

    # 4. Hydration Reminder
    hydration_key = "routine.hydration.default"

    # 5. Stress / Relaxation Activity
    if ment_hlth >= 14 or gen_hlth >= 4:
        stress_key = "routine.stress.mindfulness"
    else:
        stress_key = "routine.stress.breathing"

    # 6. Evening Routine
    evening_key = "routine.evening.winddown"

    # 7. Night / Sleep Routine
    night_key = "routine.night.hygiene"

    # 8. Daily Wellness Goals (3 to 5 items)
    goals = []

    # Goal 1: Activity
    if phys_act == 0:
        goals.append(_t("routine.goal.walk15"))
    else:
        goals.append(_t("routine.goal.walk30"))

    # Goal 2: Nutrition
    if fruits == 0 or veggies == 0:
        goals.append(_t("routine.goal.servings"))
    else:
        goals.append(_t("routine.goal.wholefoods"))

    # Goal 3: Hydration
    goals.append(_t("routine.goal.water"))

    # Goal 4: Stress/Smoking/BP specific
    if smoker == 1:
        goals.append(_t("routine.goal.smoke_free"))
    elif high_bp == 1 or high_chol == 1:
        goals.append(_t("routine.goal.low_sodium"))
    elif ment_hlth >= 7:
        goals.append(_t("routine.goal.relaxation"))

    # Goal 5: Sleep
    goals.append(_t("routine.goal.sleep7h"))

    return {
        "morning_routine": _t(morning_key),
        "afternoon_routine": _t(afternoon_key),
        "evening_routine": _t(evening_key),
        "night_routine": _t(night_key),
        "physical_activity": _t(activity_key),
        "healthy_eating": _t(eating_key),
        "hydration_reminder": _t(hydration_key),
        "stress_relaxation": _t(stress_key),
        "sleep_routine": _t(night_key),
        "daily_goals": goals[:5],
        "disclaimer": _t("routine.disclaimer"),
    }
