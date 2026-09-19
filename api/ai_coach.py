"""
AI Coach Service — Isolated LLM provider module for Heart Health Hub Wellness Coach.

Design:
- API key is read from the GROQ_API_KEY environment variable (never from frontend).
- Model name is read from GROQ_MODEL environment variable (default: llama-3.3-70b-versatile).
- If no key is configured, returns a clear configuration error message.
- Full diagnostic logs are safely printed to the backend terminal (never exposing secrets).
- Strict safety system prompt is enforced — the AI is a wellness assistant, not a doctor.
- Uses the official Groq Python SDK (groq).
"""

import os
import logging
import time
from typing import Optional


# ---------------------------------------------------------------------------
# Safe logger
# ---------------------------------------------------------------------------

logger = logging.getLogger("ai_coach")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[AI Coach] %(asctime)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


# ---------------------------------------------------------------------------
# Safety & persona system prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are Heart Health Hub Wellness Coach — a supportive, evidence-based wellness assistant built into the Heart Health Hub heart health platform.

YOUR ROLE:
- Provide personalized, practical general wellness guidance based on the user's health context.
- Help users understand their model-estimated risk score in plain language.
- Suggest realistic lifestyle improvements for activity, nutrition, sleep, stress, and monitoring.
- Be warm, encouraging, and easy to understand.

STRICT SAFETY RULES — NEVER VIOLATE THESE:
1. NEVER diagnose any disease or medical condition.
2. NEVER claim that the model has confirmed or detected heart disease. The Heart Health Hub output is a statistical model-estimated risk score, not a clinical diagnosis.
3. NEVER prescribe, recommend, or mention specific medications or dosages.
4. NEVER replace professional medical advice. Always encourage the user to consult a qualified healthcare professional for medical decisions.
5. If the user describes chest pain, severe shortness of breath, or other emergency symptoms, immediately advise them to call emergency services (e.g. 108/911) or go to an emergency room.
6. Do not make guarantees about health outcomes.
7. Do not speculate about causes of diseases or attribute symptoms to specific conditions.

FORMATTING:
- Keep responses concise (3-6 sentences typically, or a short bulleted list).
- Use friendly but professional language.
- Do not repeat disclaimers in every single message — include one where appropriate.
- Use bullet points for lists of tips.
- Do not use markdown headers in responses (no ##, ###).

CONTEXT USAGE:
- When the user's Heart Health Hub data is provided, reference it naturally.
- Refer to risk factors by their common names (e.g., "high blood pressure" not "HighBP").
- When no prediction data is available, provide general wellness guidance.
"""

# ---------------------------------------------------------------------------
# Fallback response (used when no API key is configured)
# ---------------------------------------------------------------------------

NO_KEY_FALLBACK = (
    "AI Coach is not configured yet. Please configure the Groq API key."
)

# ---------------------------------------------------------------------------
# Feature name mapping (internal → human-readable)
# ---------------------------------------------------------------------------

FEATURE_LABELS = {
    "HighBP": "high blood pressure",
    "HighChol": "high cholesterol",
    "CholCheck": "cholesterol not recently checked",
    "BMI": "body mass index (BMI)",
    "Smoker": "smoking",
    "Stroke": "history of stroke",
    "Diabetes": "diabetes",
    "PhysActivity": "low physical activity",
    "Fruits": "low fruit consumption",
    "Veggies": "low vegetable consumption",
    "HvyAlcoholConsump": "heavy alcohol consumption",
    "AnyHealthcare": "lack of healthcare access",
    "NoDocbcCost": "unable to see doctor due to cost",
    "GenHlth": "general health rating",
    "MentHlth": "poor mental health days",
    "PhysHlth": "poor physical health days",
    "DiffWalk": "difficulty walking",
    "Sex": "sex",
    "Age": "age group",
    "Education": "education level",
    "Income": "income level",
}


def _humanize_context(patient_context: dict) -> str:
    """Convert patient_context dict into a readable text block for the system prompt."""
    parts = []

    risk_result = patient_context.get("risk_result", "")
    risk_score = patient_context.get("risk_score")
    risk_factors = patient_context.get("risk_factors", [])
    health_goals = patient_context.get("health_goals", [])
    recommendations = patient_context.get("recommendations", [])

    if risk_result:
        parts.append(f"Model-Estimated Risk Category: {risk_result}")
    if risk_score is not None:
        parts.append(f"Model-Estimated Risk Score: {risk_score:.1f}% (statistical estimate, not a diagnosis)")
    if risk_factors:
        humanized = [FEATURE_LABELS.get(f, f) for f in risk_factors]
        parts.append(f"Top Mathematical Contributing Factors (from SHAP explainability): {', '.join(humanized)}")
    if health_goals:
        goals_str = "; ".join(health_goals[:5])
        parts.append(f"User's Current Health Goals: {goals_str}")
    if recommendations:
        recs_str = "; ".join(recommendations[:4])
        parts.append(f"Existing Wellness Recommendations: {recs_str}")

    if not parts:
        return "No prediction data available for this user yet."

    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def generate_coach_reply(message: str, patient_context: Optional[dict] = None) -> str:
    """
    Generate a wellness coach reply using the Groq API.

    Args:
        message: The user's chat message.
        patient_context: Dict containing risk_result, risk_score, risk_factors,
                         health_goals, recommendations.

    Returns:
        AI-generated reply string, or a specific user-friendly error message.
    """
    groq_api_key = os.environ.get("GROQ_API_KEY", "").strip()
    model_name = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b").strip()

    logger.info("Request received")
    logger.info("GROQ_API_KEY configured: %s", bool(groq_api_key))
    logger.info("Model configured: %s", model_name)

    if not groq_api_key:
        logger.warning("GROQ_API_KEY is not configured in environment")
        return NO_KEY_FALLBACK

    # Build system prompt with patient context
    context_text = _humanize_context(patient_context or {})
    context_block = (
        f"\n\nUSER HEALTH CONTEXT (from Heart Health Hub platform):\n{context_text}"
        if context_text
        else ""
    )
    system_instruction = SYSTEM_PROMPT + context_block

    try:
        from groq import Groq
        from groq import APIStatusError, APIConnectionError, APITimeoutError

        # Inject native OS certificate store via truststore if available.
        # This securely handles Windows AV / enterprise SSL inspection without disabling verification.
        import httpx
        try:
            import truststore
            truststore.inject_into_ssl()
            _http_client = httpx.Client()
            logger.info("SSL: using native OS certificate store via truststore")
        except Exception:
            try:
                import certifi
                _ssl_verify = certifi.where()
                logger.info("SSL: using certifi CA bundle")
            except ImportError:
                _ssl_verify = True
                logger.warning("certifi not installed; using system default")
            _http_client = httpx.Client(verify=_ssl_verify)

        client = Groq(api_key=groq_api_key, http_client=_http_client)

        logger.info("Groq request attempt 1 using model: %s", model_name)

        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": message},
            ],
            temperature=0.7,
            max_tokens=400,
        )

        logger.info("Groq request succeeded")
        reply = response.choices[0].message.content
        return reply.strip() if reply else ""

    except ImportError:
        logger.error("groq Python package is not installed")
        return "The AI Coach service is not available on this server (missing groq package)."

    except APIStatusError as e:
        status_code = e.status_code
        error_body = str(e)
        logger.error("Groq APIStatusError code=%s: %s", status_code, error_body)

        # 429 — rate limit / quota exhausted
        if status_code == 429:
            logger.warning("Groq rate limit hit (429)")
            return (
                "AI Coach is temporarily unavailable because the AI service usage limit "
                "has been reached. Please try again later."
            )

        # 401 — invalid API key / unauthenticated
        if status_code == 401:
            logger.error("Groq authentication error (401)")
            return "AI Coach is not configured correctly. Please check the Groq API configuration."

        # 403 — forbidden
        if status_code == 403:
            logger.error("Groq forbidden error (403)")
            return "AI Coach is not configured correctly. Please check the Groq API configuration."

        # 5xx — server-side errors
        if status_code >= 500:
            logger.error("Groq server error (%s)", status_code)
            return "AI Coach is temporarily unavailable because the AI service is busy. Please try again later."

        # Other 4xx errors
        logger.error("Groq client error (code=%s): %s", status_code, error_body)
        return "An unexpected error occurred. Please try again."

    except APIConnectionError as e:
        # Log the full exception chain so the actual cause is visible in the terminal
        cause = getattr(e, '__cause__', None) or getattr(e, '__context__', None)
        cause_detail = f" | caused by: {type(cause).__name__}: {cause}" if cause else ""
        logger.error("Groq connection error: %s%s", str(e), cause_detail)
        if cause and "certificate" in str(cause).lower():
            logger.error("SSL fix: ensure certifi is installed (pip install certifi)")
        return "The AI Coach is temporarily unavailable. Please try again."

    except APITimeoutError as e:
        logger.error("Groq request timed out: %s", str(e))
        return "The AI Coach is temporarily unavailable. Please try again."

    except Exception as e:
        logger.exception("Groq unexpected exception [%s]: %s", type(e).__name__, str(e))
        return "An unexpected error occurred. Please try again."
