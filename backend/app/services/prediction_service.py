from typing import List

from sqlalchemy.orm import Session

from app.ai_models.vision_models.inference import run_inference
from app.models.image_study import ImageStudy
from app.models.prediction import Prediction
from app.schemas.prediction_schema import PredictionOut
from app.utils.exceptions import NotFoundError


def analyze_study(study_id: int, doctor_id: int, db: Session) -> PredictionOut:
    study = (
        db.query(ImageStudy)
        .filter(ImageStudy.id == study_id, ImageStudy.doctor_id == doctor_id)
        .first()
    )
    if not study:
        raise NotFoundError("Estudio")

    # Read image bytes from disk
    with open(study.image_path, "rb") as f:
        image_bytes = f.read()

        # Run inference with the correct model based on study type
        result = run_inference(image_bytes, study_type=study.tipo_estudio)

    prediction = Prediction(
        study_id=study.id,
        patient_id=study.patient_id,
        **result,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return PredictionOut.model_validate(prediction)


def get_patient_history(patient_id: int, doctor_id: int, db: Session) -> List[PredictionOut]:
    # Verify ownership through the study join
    predictions = (
        db.query(Prediction)
        .join(ImageStudy, Prediction.study_id == ImageStudy.id)
        .filter(
            Prediction.patient_id == patient_id,
            ImageStudy.doctor_id == doctor_id,
        )
        .order_by(Prediction.fecha_prediccion.desc())
        .all()
    )
    return [PredictionOut.model_validate(p) for p in predictions]
