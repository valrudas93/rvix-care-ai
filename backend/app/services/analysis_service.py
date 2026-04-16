from __future__ import annotations

from dataclasses import dataclass
from threading import Lock
from typing import Literal
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.analysis_job import AnalysisJob
from app.models.image_study import ImageStudy
from app.models.prediction import Prediction
from app.models.patient import Patient
from app.schemas.analysis_schema import AnalysisResult, AnalysisModelSummary, HistoryItem, JobStep
from app.services import prediction_service, study_service
from app.utils.exceptions import BadRequestError, NotFoundError
from app.ai_models.llm.llm_interface import generate_medical_explanation

JobStatusValue = Literal["queued", "processing", "completed", "error"]

STEPS = [
    JobStep(index=0, name="Preprocesamiento de imágenes"),
    JobStep(index=1, name="Modelo 1: Detección de lesiones tempranas"),
    JobStep(index=2, name="Modelo 2: Análisis de heterogeneidad tumoral"),
    JobStep(index=3, name="Generación de informe"),
]


@dataclass
class JobData:
    job_id: str
    doctor_id: int
    patient_id: int
    study_ids: list[int]
    status: JobStatusValue
    progress: float
    current_step: JobStep | None = None
    result: AnalysisResult | None = None
    error: str | None = None


_JOBS: dict[str, JobData] = {}
_JOBS_LOCK = Lock()


def _persist_job(job: JobData) -> None:
    db = SessionLocal()
    try:
        row = db.get(AnalysisJob, job.job_id)
        if row is None:
            row = AnalysisJob(
                job_id=job.job_id,
                doctor_id=job.doctor_id,
                patient_id=job.patient_id,
                study_ids=job.study_ids,
                status=job.status,
                progress=job.progress,
                current_step_index=job.current_step.index if job.current_step else None,
                result_payload=job.result.model_dump() if job.result else None,
                error=job.error,
            )
            db.add(row)
        else:
            row.status = job.status
            row.progress = job.progress
            row.current_step_index = job.current_step.index if job.current_step else None
            row.result_payload = job.result.model_dump() if job.result else None
            row.error = job.error

        db.commit()
    finally:
        db.close()


def _load_job(job_id: str) -> JobData | None:
    db = SessionLocal()
    try:
        row = db.get(AnalysisJob, job_id)
        if row is None:
            return None

        current_step = None
        if row.current_step_index is not None and 0 <= row.current_step_index < len(STEPS):
            current_step = STEPS[row.current_step_index]

        result = AnalysisResult.model_validate(row.result_payload) if row.result_payload else None
        return JobData(
            job_id=row.job_id,
            doctor_id=row.doctor_id,
            patient_id=row.patient_id,
            study_ids=list(row.study_ids or []),
            status=row.status,
            progress=row.progress,
            current_step=current_step,
            result=result,
            error=row.error,
        )
    finally:
        db.close()


def _upsert_in_memory(job: JobData) -> None:
    with _JOBS_LOCK:
        _JOBS[job.job_id] = job


def _set_status(job_id: str, status: JobStatusValue, progress: float, step_index: int | None = None) -> None:
    with _JOBS_LOCK:
        job = _JOBS.get(job_id)
        if not job:
            return
        job.status = status
        job.progress = progress
        job.current_step = STEPS[step_index] if step_index is not None else None
    _persist_job(job)


def _set_result(job_id: str, result: AnalysisResult) -> None:
    with _JOBS_LOCK:
        job = _JOBS.get(job_id)
        if not job:
            return
        job.result = result
        job.status = "completed"
        job.progress = 100
        job.current_step = STEPS[3]
    _persist_job(job)


def _set_error(job_id: str, error_message: str) -> None:
    with _JOBS_LOCK:
        job = _JOBS.get(job_id)
        if not job:
            return
        job.status = "error"
        job.error = error_message
    _persist_job(job)


def _format_risk_level(prediction: str) -> str:
    if prediction.startswith("bajo"):
        return "bajo"
    if prediction.startswith("medio"):
        return "medio"
    if prediction.startswith("alto"):
        return "alto"
    return prediction


def _build_findings(prediction: str, confidence: float, detected_regions: list[str] | None) -> str:
    regions_text = ", ".join(detected_regions or []) if detected_regions else "sin hallazgos relevantes"
    return (
        f"Clasificación {prediction} con confianza {round(confidence * 100, 2)}%. "
        f"Regiones detectadas: {regions_text}."
    )


def _build_result(predictions) -> AnalysisResult:
    if not predictions:
        raise BadRequestError("No se pudo generar una predicción válida.")

    severity_order = {"bajo_riesgo": 0, "medio_riesgo": 1, "alto_riesgo": 2}
    top_prediction = max(predictions, key=lambda p: severity_order.get(p.prediction, -1))

    all_regions: list[str] = []
    all_recommendations: list[str] = []
    for prediction in predictions:
        all_regions.extend(prediction.detected_regions or [])
        all_recommendations.extend(prediction.recommendations or [])

    # Preserve order while removing duplicates.
    unique_regions = list(dict.fromkeys(all_regions))
    unique_recommendations = list(dict.fromkeys(all_recommendations))

    model_1_prediction = predictions[0]
    model_2_prediction = predictions[1] if len(predictions) > 1 else predictions[0]

    return AnalysisResult(
        riskLevel=_format_risk_level(top_prediction.prediction),
        confidence=round(top_prediction.confidence * 100, 2),
        detectedRegions=unique_regions,
        recommendations=unique_recommendations,
        model1=AnalysisModelSummary(
            name="Detección de Lesiones Tempranas",
            status="completado",
            findings=_build_findings(
                model_1_prediction.prediction,
                model_1_prediction.confidence,
                model_1_prediction.detected_regions,
            ),
        ),
        model2=AnalysisModelSummary(
            name="Análisis de Heterogeneidad Tumoral",
            status="completado",
            findings=_build_findings(
                model_2_prediction.prediction,
                model_2_prediction.confidence,
                model_2_prediction.detected_regions,
            ),
        ),
    )


def _get_or_create_auto_patient(db: Session, doctor_id: int) -> int:
    identificacion = f"AUTO-{doctor_id}"
    patient = (
        db.query(Patient)
        .filter(Patient.identificacion == identificacion, Patient.doctor_id == doctor_id)
        .first()
    )
    if patient:
        return patient.id

    patient = Patient(
        nombre="Paciente temporal",
        edad=30,
        identificacion=identificacion,
        doctor_id=doctor_id,
        antecedentes="Creado automáticamente por flujo /api/analyze",
        resultados_previos="",
        tipo_muestra="ambas",
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient.id


async def create_job(
    doctor_id: int,
    citology_files: list[UploadFile],
    mri_files: list[UploadFile],
    patient_id: int | None,
    db: Session,
) -> str:
    if not citology_files and not mri_files:
        raise BadRequestError("Debe enviar al menos una imagen de citología o resonancia.")

    if patient_id is None:
        selected_patient_id = _get_or_create_auto_patient(db, doctor_id)
    else:
        patient = (
            db.query(Patient)
            .filter(Patient.id == patient_id, Patient.doctor_id == doctor_id)
            .first()
        )
        # Fall back to auto-patient if the stored ID no longer exists
        selected_patient_id = patient.id if patient else _get_or_create_auto_patient(db, doctor_id)

    study_ids: list[int] = []

    if citology_files:
        study = await study_service.upload_study(
            patient_id=selected_patient_id,
            doctor_id=doctor_id,
            tipo_estudio="citologia",
            notas_medicas="Estudio cargado desde /api/analyze",
            file=citology_files[0],
            db=db,
        )
        study_ids.append(study.id)

    if mri_files:
        study = await study_service.upload_study(
            patient_id=selected_patient_id,
            doctor_id=doctor_id,
            tipo_estudio="resonancia",
            notas_medicas="Estudio cargado desde /api/analyze",
            file=mri_files[0],
            db=db,
        )
        study_ids.append(study.id)

    job_id = str(uuid4())
    with _JOBS_LOCK:
        job = JobData(
            job_id=job_id,
            doctor_id=doctor_id,
            patient_id=selected_patient_id,
            study_ids=study_ids,
            status="queued",
            progress=0,
            current_step=STEPS[0],
        )
        _JOBS[job_id] = job
    _persist_job(job)

    return job_id


def process_job(job_id: str) -> None:
    with _JOBS_LOCK:
        job = _JOBS.get(job_id)
    if not job:
        return

    db = SessionLocal()
    try:
        _set_status(job_id, "processing", 20, step_index=0)
        predictions = []

        if job.study_ids:
            _set_status(job_id, "processing", 45, step_index=1)
            predictions.append(prediction_service.analyze_study(job.study_ids[0], job.doctor_id, db))

        if len(job.study_ids) > 1:
            _set_status(job_id, "processing", 70, step_index=2)
            predictions.append(prediction_service.analyze_study(job.study_ids[1], job.doctor_id, db))

        _set_status(job_id, "processing", 90, step_index=3)
        result = _build_result(predictions)

        # Generate LLM explanation and persist to each prediction record
        try:
            explanation = generate_medical_explanation(
                prediction=result.riskLevel + "_riesgo",
                confidence=result.confidence / 100,
                detected_regions=result.detectedRegions,
                recommendations=result.recommendations,
                model1_findings=result.model1.findings,
                model2_findings=result.model2.findings,
            )
            result.medical_explanation = explanation

            # Save to DB predictions
            for pred_out in predictions:
                pred_row = db.get(Prediction, pred_out.id)
                if pred_row:
                    pred_row.medical_explanation = explanation
            db.commit()
        except Exception as llm_exc:
            logger.warning("LLM explanation failed (non-fatal): %s", llm_exc)

        _set_result(job_id, result)
    except Exception as exc:
        _set_error(job_id, str(exc))
    finally:
        db.close()


def get_job_status(job_id: str) -> JobData:
    with _JOBS_LOCK:
        job = _JOBS.get(job_id)
    if not job:
        job = _load_job(job_id)
        if job:
            _upsert_in_memory(job)
    if not job:
        raise NotFoundError("Job")
    return job


def get_job_result(job_id: str) -> JobData:
    with _JOBS_LOCK:
        job = _JOBS.get(job_id)
    if not job:
        job = _load_job(job_id)
        if job:
            _upsert_in_memory(job)
    if not job:
        raise NotFoundError("Job")
    return job


def get_doctor_history(doctor_id: int, db: Session) -> list[HistoryItem]:
    rows = (
        db.query(Prediction, Patient, ImageStudy)
        .join(Patient, Prediction.patient_id == Patient.id)
        .join(ImageStudy, Prediction.study_id == ImageStudy.id)
        .filter(ImageStudy.doctor_id == doctor_id)
        .order_by(Prediction.fecha_prediccion.desc())
        .all()
    )

    def _risk(prediction: str) -> str:
        if prediction.startswith("bajo"):
            return "bajo"
        if prediction.startswith("medio"):
            return "medio"
        if prediction.startswith("alto"):
            return "alto"
        return prediction

    return [
        HistoryItem(
            prediction_id=prediction.id,
            patient_id=patient.id,
            patient_identifier=patient.identificacion,
            study_type=study.tipo_estudio,
            risk_level=_risk(prediction.prediction),
            confidence=round(prediction.confidence * 100, 2),
            date=prediction.fecha_prediccion.isoformat(),
            detected_regions=prediction.detected_regions or [],
            recommendations=prediction.recommendations or [],
            medical_explanation=prediction.medical_explanation,
        )
        for prediction, patient, study in rows
    ]
