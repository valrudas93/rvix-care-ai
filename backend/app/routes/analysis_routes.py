from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.doctor import Doctor
from app.schemas.analysis_schema import AnalyzeResponse, HistoryItem, JobResultResponse, JobStatusResponse
from app.services import analysis_service
from app.utils.dependencies import get_current_doctor

router = APIRouter(prefix="/api", tags=["Frontend Compatibility"])

_ALLOWED_MIME = {"image/jpeg", "image/png", "image/bmp", "image/tiff", "image/webp"}
_ALLOWED_EXT  = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"}


def _validate_image_files(files: list[UploadFile], field: str) -> None:
    import os
    for f in files:
        ext = os.path.splitext(f.filename or "")[1].lower()
        mime = (f.content_type or "").split(";")[0].strip()
        if mime not in _ALLOWED_MIME or ext not in _ALLOWED_EXT:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"El archivo '{f.filename}' en '{field}' no es una imagen válida. "
                    f"Formatos aceptados: JPEG, PNG, BMP, TIFF, WEBP. "
                    f"Se recibió: tipo='{mime}', extensión='{ext}'."
                ),
            )


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_images(
    background_tasks: BackgroundTasks,
    citology: list[UploadFile] | None = File(None),
    mri: list[UploadFile] | None = File(None),
    patient_id: int | None = Form(None),
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    citology_files = citology or []
    mri_files = mri or []

    if citology_files:
        _validate_image_files(citology_files, "citology")
    if mri_files:
        _validate_image_files(mri_files, "mri")

    job_id = await analysis_service.create_job(
        doctor_id=current_doctor.id,
        citology_files=citology_files,
        mri_files=mri_files,
        patient_id=patient_id,
        db=db,
    )
    background_tasks.add_task(analysis_service.process_job, job_id)
    return AnalyzeResponse(jobId=job_id)


@router.get("/status/{job_id}", response_model=JobStatusResponse)
def get_status(
    job_id: str,
    current_doctor: Doctor = Depends(get_current_doctor),
):
    job = analysis_service.get_job_status(job_id)
    if job.doctor_id != current_doctor.id:
        from app.utils.exceptions import NotFoundError

        raise NotFoundError("Job")

    return JobStatusResponse(
        jobId=job.job_id,
        status=job.status,
        progress=job.progress,
        current_step=job.current_step,
    )


@router.get("/results/{job_id}", response_model=JobResultResponse)
def get_results(
    job_id: str,
    current_doctor: Doctor = Depends(get_current_doctor),
):
    job = analysis_service.get_job_result(job_id)
    if job.doctor_id != current_doctor.id:
        from app.utils.exceptions import NotFoundError

        raise NotFoundError("Job")

    return JobResultResponse(
        status=job.status,
        progress=job.progress,
        result=job.result,
    )


@router.get("/history", response_model=List[HistoryItem])
def get_history(
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    return analysis_service.get_doctor_history(current_doctor.id, db)
