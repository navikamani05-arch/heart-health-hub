"""
Wellness Recommendations Module
Returns translation keys for general wellness suggestions based on patient inputs.
Actual text is stored in translations/en.json and translations/ta.json.

IMPORTANT:
- Keys, not strings, are returned — the caller translates them via utils.i18n.t().
- No medical diagnoses, treatment plans, or clinical advice are made.
"""


def generate_recommendations(patient_inputs: dict) -> list[str]:
    """
    Returns a list of translation key strings for general wellness suggestions.

    Args:
        patient_inputs: dict mapping feature names to their values.

    Returns:
        List of translation key strings (e.g. ['rec.highbp', 'rec.smoker']).
    """
    keys = []

    if patient_inputs.get('HighBP') == 1:
        keys.append('rec.highbp')

    if patient_inputs.get('HighChol') == 1:
        keys.append('rec.highchol')

    bmi = patient_inputs.get('BMI', 0)
    if bmi >= 30:
        keys.append('rec.bmi.obese')
    elif bmi >= 25:
        keys.append('rec.bmi.overweight')

    if patient_inputs.get('Smoker') == 1:
        keys.append('rec.smoker')

    if patient_inputs.get('PhysActivity') == 0:
        keys.append('rec.physactivity')

    if patient_inputs.get('Fruits') == 0:
        keys.append('rec.fruits')

    if patient_inputs.get('Veggies') == 0:
        keys.append('rec.veggies')

    if patient_inputs.get('HvyAlcoholConsump') == 1:
        keys.append('rec.hvyalcohol')

    gen_hlth = patient_inputs.get('GenHlth', 1)
    if gen_hlth == 5:
        keys.append('rec.genhlth.poor')
    elif gen_hlth == 4:
        keys.append('rec.genhlth.fair')

    if patient_inputs.get('MentHlth', 0) >= 14:
        keys.append('rec.menthlth')

    if patient_inputs.get('DiffWalk') == 1:
        keys.append('rec.diffwalk')

    if patient_inputs.get('AnyHealthcare') == 0:
        keys.append('rec.healthcare')

    if patient_inputs.get('Stroke') == 1:
        keys.append('rec.stroke')

    diabetes_val = patient_inputs.get('Diabetes', 0)
    if diabetes_val == 1:
        keys.append('rec.diabetes.pre')
    elif diabetes_val == 2:
        keys.append('rec.diabetes.yes')

    if not keys:
        keys.append('rec.default')

    return keys
