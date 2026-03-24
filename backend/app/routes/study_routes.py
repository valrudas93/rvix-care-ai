from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.doctor import Doctor
from app.schemas.study_schema import StudyOut
from app.services import study_service
from app.utils.dependencies import get_current_doctor

router = APIRouter(prefix="/studies", tags=["Estudios"])


@router.post("/upload-image", response_model=StudyOut, status_code=201)
async def upload_image(
    patient_id: int = Form(...),
    tipo_estudio: str = Form(...),
    notas_medicas: str | None = Form(None),
    file: UploadFile = File(...),
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    return await study_service.upload_study(
        patient_id=patient_id,
        doctor_id=current_doctor.id,
        tipo_estudio=tipo_estudio,
        notas_medicas=notas_medicas,
        file=file,
        db=db,
    )
