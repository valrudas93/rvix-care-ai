from typing import List

from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.schemas.patient_schema import PatientCreate, PatientUpdate, PatientOut
from app.utils.exceptions import NotFoundError, ConflictError


def create_patient(data: PatientCreate, doctor_id: int, db: Session) -> PatientOut:
    if db.query(Patient).filter(Patient.identificacion == data.identificacion).first():
        raise ConflictError(f"Ya existe un paciente con identificación {data.identificacion}.")

    patient = Patient(**data.model_dump(), doctor_id=doctor_id)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return PatientOut.model_validate(patient)


def get_patients(doctor_id: int, db: Session) -> List[PatientOut]:
    patients = db.query(Patient).filter(Patient.doctor_id == doctor_id).all()
    return [PatientOut.model_validate(p) for p in patients]


def get_patient(patient_id: int, doctor_id: int, db: Session) -> PatientOut:
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id, Patient.doctor_id == doctor_id)
        .first()
    )
    if not patient:
        raise NotFoundError("Paciente")
    return PatientOut.model_validate(patient)


def update_patient(patient_id: int, data: PatientUpdate, doctor_id: int, db: Session) -> PatientOut:
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id, Patient.doctor_id == doctor_id)
        .first()
    )
    if not patient:
        raise NotFoundError("Paciente")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)
    return PatientOut.model_validate(patient)
