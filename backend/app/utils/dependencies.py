from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.config.security import decode_token
from app.database.connection import get_db
from app.models.doctor import Doctor
from app.utils.exceptions import UnauthorizedError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_doctor(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Doctor:
    payload = decode_token(token)
    if payload is None:
        raise UnauthorizedError("Token inválido o expirado.")

    doctor_id: int | None = payload.get("sub")
    if doctor_id is None:
        raise UnauthorizedError()

    doctor = db.get(Doctor, int(doctor_id))
    if doctor is None:
        raise UnauthorizedError("Médico no encontrado.")

    return doctor
