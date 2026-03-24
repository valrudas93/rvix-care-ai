from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class StudyOut(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    image_path: str
    fecha_estudio: datetime
    tipo_estudio: str
    notas_medicas: Optional[str] = None

    model_config = {"from_attributes": True}
