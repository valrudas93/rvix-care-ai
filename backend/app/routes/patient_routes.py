from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.doctor import Doctor
from app.schemas.patient_schema import PatientCreate, PatientUpdate, PatientOut
from app.services import patient_service
from app.utils.dependencies import get_current_doctor

router = APIRouter(prefix="/patients", tags=["Pacientes"])


@router.get("", response_model=List[PatientOut])
def list_patients(
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    return patient_service.get_patients(current_doctor.id, db)


@router.post("", response_model=PatientOut, status_code=201)
def create_patient(
    data: PatientCreate,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    return patient_service.create_patient(data, current_doctor.id, db)


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(
    patient_id: int,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    return patient_service.get_patient(patient_id, current_doctor.id, db)


@router.patch("/{patient_id}", response_model=PatientOut)
def update_patient(
    patient_id: int,
    data: PatientUpdate,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    return patient_service.update_patient(patient_id, data, current_doctor.id, db)
