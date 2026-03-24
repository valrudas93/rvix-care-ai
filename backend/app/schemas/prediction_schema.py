from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class PredictionOut(BaseModel):
    id: int
    study_id: int
    patient_id: int
    prediction: str
    confidence: float
    detected_regions: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    medical_explanation: Optional[str] = None
    fecha_prediccion: datetime

    model_config = {"from_attributes": True}


# ── LLM ───────────────────────────────────────────────────────────────────────

class ExplainRequest(BaseModel):
    prediction: str
    confidence: float
    detected_regions: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    model1_findings: Optional[str] = None
    model2_findings: Optional[str] = None
    clinical_data: Optional[Dict[str, Any]] = None


class ExplainResponse(BaseModel):
    medical_explanation: str
