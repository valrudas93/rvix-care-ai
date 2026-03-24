from datetime import datetime
from pydantic import BaseModel, EmailStr


class DoctorOut(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    especialidad: str
    hospital: str
    fecha_creacion: datetime

    model_config = {"from_attributes": True}
