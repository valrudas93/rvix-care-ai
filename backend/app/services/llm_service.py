from sqlalchemy.orm import Session

from app.ai_models.llm.llm_interface import generate_medical_explanation
from app.models.prediction import Prediction
from app.schemas.prediction_schema import ExplainRequest, ExplainResponse
from app.utils.exceptions import NotFoundError


def explain_prediction(data: ExplainRequest, prediction_id: int | None, db: Session) -> ExplainResponse:
    """
    Generate a medical explanation and optionally persist it to a prediction record.

    - If prediction_id is provided, saves the explanation to that DB record.
    - Can also be called standalone (prediction_id=None) for on-the-fly explanations.
    """
    explanation = generate_medical_explanation(
        prediction=data.prediction,
        confidence=data.confidence,
        detected_regions=data.detected_regions,
        recommendations=data.recommendations,
        model1_findings=data.model1_findings,
        model2_findings=data.model2_findings,
        clinical_data=data.clinical_data,
    )

    if prediction_id is not None:
        pred = db.get(Prediction, prediction_id)
        if pred:
            pred.medical_explanation = explanation
            db.commit()

    return ExplainResponse(medical_explanation=explanation)
