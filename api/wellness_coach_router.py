"""
Wellness Coach Router — FastAPI routes for the AI Wellness Coach chat endpoint.

Endpoint:
    POST /api/wellness-coach/chat

This module is intentionally thin — it validates the request and delegates
all AI logic to api/ai_coach.py so the provider can be swapped easily.
"""

from typing import Optional, List
from fastapi import APIRouter
from pydantic import BaseModel

from api.ai_coach import generate_coach_reply

router = APIRouter(prefix="/api/wellness-coach", tags=["Wellness Coach"])


# ---------------------------------------------------------------------------
# Request / Response Models
# ---------------------------------------------------------------------------

class PatientContext(BaseModel):
    risk_result: Optional[str] = None
    risk_score: Optional[float] = None
    risk_factors: Optional[List[str]] = []
    health_goals: Optional[List[str]] = []
    recommendations: Optional[List[str]] = []


class CoachChatRequest(BaseModel):
    message: str
    patient_context: Optional[PatientContext] = None


class CoachChatResponse(BaseModel):
    reply: str


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.post("/chat", response_model=CoachChatResponse)
def wellness_coach_chat(req: CoachChatRequest):
    """
    AI Wellness Coach conversational endpoint.

    Accepts a user message and optional patient context (risk result, SHAP
    factors, health goals) and returns an AI-generated wellness reply.

    The AI key is kept server-side. Frontend never sees it.
    If no key is configured, a graceful fallback message is returned.
    """
    context_dict = req.patient_context.model_dump() if req.patient_context else {}

    reply = generate_coach_reply(
        message=req.message,
        patient_context=context_dict,
    )

    return CoachChatResponse(reply=reply)
