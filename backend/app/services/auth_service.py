from sqlalchemy.orm import Session

from app.config.security import hash_password, verify_password, create_access_token
from app.models.doctor import Doctor
from app.schemas.auth_schema import LoginRequest, RegisterRequest, TokenResponse
from app.utils.exceptions import UnauthorizedError, ConflictError


def login(data: LoginRequest, db: Session) -> TokenResponse:
    doctor = db.query(Doctor).filter(Doctor.email == data.email).first()
    if not doctor or not verify_password(data.password, doctor.password_hash):
        raise UnauthorizedError("Credenciales incorrectas.")

    token = create_access_token({"sub": str(doctor.id)})
    return TokenResponse(
        access_token=token,
        doctor_id=doctor.id,
        nombre=doctor.nombre,
    )


def register(data: RegisterRequest, db: Session) -> TokenResponse:
    if db.query(Doctor).filter(Doctor.email == data.email).first():
        raise ConflictError("Ya existe un médico con ese correo.")

    doctor = Doctor(
        nombre=data.nombre,
        email=data.email,
        password_hash=hash_password(data.password),
        especialidad=data.especialidad,
        hospital=data.hospital,
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    token = create_access_token({"sub": str(doctor.id)})
    return TokenResponse(
        access_token=token,
        doctor_id=doctor.id,
        nombre=doctor.nombre,
    )
