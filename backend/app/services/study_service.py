from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.image_study import ImageStudy
from app.models.patient import Patient
from app.schemas.study_schema import StudyOut
from app.utils.exceptions import NotFoundError, BadRequestError
from app.utils.file_manager import save_upload_file


async def upload_study(
    patient_id: int,
    doctor_id: int,
    tipo_estudio: str,
    notas_medicas: str | None,
    file: UploadFile,
    db: Session,
) -> StudyOut:
    # Ensure patient belongs to this doctor
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id, Patient.doctor_id == doctor_id)
        .first()
    )
    if not patient:
        raise NotFoundError("Paciente")

    try:
        image_path = await save_upload_file(file, sub_folder="studies")
    except ValueError as exc:
        raise BadRequestError(str(exc))

    study = ImageStudy(
        patient_id=patient_id,
        doctor_id=doctor_id,
        image_path=image_path,
        tipo_estudio=tipo_estudio,
        notas_medicas=notas_medicas,
    )
    db.add(study)
    db.commit()
    db.refresh(study)
    return StudyOut.model_validate(study)
