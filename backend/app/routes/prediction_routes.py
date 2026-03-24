from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.doctor import Doctor
from app.schemas.prediction_schema import PredictionOut
from app.services import prediction_service
from app.utils.dependencies import get_current_doctor

router = APIRouter(prefix="/predictions", tags=["Predicciones"])


@router.post("/analyze/{study_id}", response_model=PredictionOut, status_code=201)
def analyze(
    study_id: int,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """Run ViT inference on an existing study image and save the prediction."""
    return prediction_service.analyze_study(study_id, current_doctor.id, db)


@router.get("/history/{patient_id}", response_model=List[PredictionOut])
def history(
    patient_id: int,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """Return all predictions for a patient (most recent first)."""
    return prediction_service.get_patient_history(patient_id, current_doctor.id, db)
