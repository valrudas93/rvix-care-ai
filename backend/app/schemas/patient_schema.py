from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class PatientCreate(BaseModel):
    nombre: str
    edad: int
    identificacion: str
    antecedentes: Optional[str] = None
    resultados_previos: Optional[str] = None
    tipo_muestra: Optional[str] = None


class PatientUpdate(BaseModel):
    nombre: Optional[str] = None
    edad: Optional[int] = None
    antecedentes: Optional[str] = None
    resultados_previos: Optional[str] = None
    tipo_muestra: Optional[str] = None


class PatientOut(BaseModel):
    id: int
    nombre: str
    edad: int
    identificacion: str
    fecha_registro: datetime
    doctor_id: int
    antecedentes: Optional[str] = None
    resultados_previos: Optional[str] = None
    tipo_muestra: Optional[str] = None

    model_config = {"from_attributes": True}
