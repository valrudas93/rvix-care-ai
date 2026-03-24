from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.doctor import Doctor
from app.schemas.prediction_schema import ExplainRequest, ExplainResponse
from app.services import llm_service
from app.utils.dependencies import get_current_doctor

router = APIRouter(prefix="/llm", tags=["LLM – Explicación Médica"])


@router.post("/explain-prediction", response_model=ExplainResponse)
def explain_prediction(
    data: ExplainRequest,
    prediction_id: Optional[int] = Query(None, description="ID de predicción para persistir la explicación"),
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """
    Generate a natural-language medical explanation for a ViT prediction.

    Optionally pass `prediction_id` to save the explanation to that record.
    """
    return llm_service.explain_prediction(data, prediction_id, db)
